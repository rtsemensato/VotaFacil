import React, { useEffect, useState } from "react";
import { useAuth } from "../store/AuthContext";
import { getPublicPolls } from "../api/poll";
import type { Poll } from "../types";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { io } from "socket.io-client";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");
    const [audio] = useState(() => {
        const a = new window.Audio("https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3");
        a.volume = 0.3;
        return a;
    });

    const navigate = useNavigate();

    // Get polls
    useEffect(() => {
        setLoading(true);

        getPublicPolls(page, search, "active", 5)
            .then((data) => {
                console.log("data: ", data);
                setPolls(data);
            })
            .catch(() => setError("Erro ao carregar enquetes"))
            .finally(() => setLoading(false));
    }, [page, search]);

    // Real-time update via socket
    useEffect(() => {
        const s = io(import.meta.env.VITE_API_URL.replace("/api", ""));

        s.on("pollListUpdate", (updatedPoll) => {
            setPolls((prev) =>
                prev.map((p) => (p.id === updatedPoll.id ? updatedPoll : p))
            );
            if (user && updatedPoll.createdBy) {
                const createdById = typeof updatedPoll.createdBy === "string"
                    ? updatedPoll.createdBy
                    : updatedPoll.createdBy.id;

                if (createdById === user.id) {
                    setToast(`Sua enquete "${updatedPoll.title}" acabou de receber um voto.`);
                    audio.currentTime = 0;
                    audio.play();
                }
            }
        });

        return () => s.disconnect();
    }, [user, audio]);

    // Toast timeout
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(""), 3500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    return (
        <div className={styles.dashboardContainer}>
            {toast && <div className={styles.toast}>{toast}</div>}
            <div className={styles.card}>
                <h1 className={styles.title}>Bem-vindo, {user?.name}!</h1>
                <div className={styles.searchBar}>
                    <input
                        className={styles.input}
                        placeholder="Buscar enquetes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className={styles.button} onClick={() => setPage(1)}>Buscar</button>
                </div>
                <button
                    className={styles.createBtn}
                    onClick={() => navigate("/polls/new")}
                >
                    Criar nova enquete
                </button>
                <button
                    className={styles.logout}
                    onClick={logout}
                >
                    Sair
                </button>
                {loading ? (
                    <div>Carregando enquetes...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : polls.length === 0 ? (
                    <div className={styles.empty}>Nenhuma enquete encontrada</div>
                ) : (
                    <ul className={styles.pollList}>
                        {polls.map((poll) => {
                            const totalVotes = poll.votes.length;
                            const results = poll.options.map(opt => ({
                                option: opt,
                                count: poll.votes.filter(v => v.option === opt).length,
                            }));

                            return (
                                <li key={poll.id} className={styles.pollItem}>
                                    <Link to={`/polls/${poll.id}`} className={styles.pollTitle}>
                                        {poll.title}
                                    </Link>
                                    <div className={styles.pollDesc}>{poll.description}</div>
                                    <div className={styles.pollDate}>Expira em: {new Date(poll.expiresAt).toLocaleString()}</div>
                                    <div className={styles.pollResults}>
                                        {results.map(r => (
                                            <div key={r.option} className={styles.resultRow}>
                                                <span>{r.option}</span>
                                                <span>{r.count} voto(s)</span>
                                                <span>{totalVotes > 0 ? ((r.count / totalVotes) * 100).toFixed(1) : 0}%</span>
                                                <div className={styles.resultBarWrapper}>
                                                    <div className={styles.resultBar} style={{ width: `${totalVotes > 0 ? (r.count / totalVotes) * 100 : 0}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                        <div className={styles.totalVotes}>Total de votos: {totalVotes}</div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                <div className={styles.pagination}>
                    <button className={styles.button} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
                    <span>Página {page}</span>
                    <button className={styles.button} onClick={() => setPage(p => p + 1)} disabled={polls.length < 5}>Próxima</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 