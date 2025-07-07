import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { getPollById, votePoll } from "../api/poll";
import type { Poll } from "../types";
import { io } from "socket.io-client";
import styles from "./PollDetails.module.css";

const PollDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { accessToken } = useAuth();
    const navigate = useNavigate();
    const [poll, setPoll] = useState<Poll | null>(null);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [voted, setVoted] = useState(false);
    const [toast, setToast] = useState<string>("");

    // Get da enquete
    useEffect(() => {
        if (!accessToken || !id) return;

        setLoading(true);

        getPollById(accessToken, id)
            .then(data => {
                setPoll(data);
                setVoted(data.votes.some(v => v.user === data.createdBy.id));
            })
            .catch(() => setError("Erro ao carregar enquete"))
            .finally(() => setLoading(false));
    }, [accessToken, id]);

    // Conectar ao WebSocket
    useEffect(() => {
        if (!id) return;

        const s = io(import.meta.env.VITE_API_URL.replace("/api", ""));

        s.emit("join_poll", id);
        s.on("vote_update", (data: Poll) => setPoll(data));

        return () => {
            s.emit("leave_poll", id);
            s.disconnect();
        };
    }, [id]);

    const handleVote = async () => {
        if (!accessToken || !id || !selected) return;

        setLoading(true);

        try {
            const updated = await votePoll(accessToken, id, selected);
            setPoll(updated);
            setVoted(true);
        } catch (err: unknown) {
            if (
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof (err as { response?: unknown }).response === "object" &&
                (err as { response?: { data?: { error?: string } } }).response?.data?.error
            ) {
                setToast((err as { response: { data: { error: string } } }).response.data.error);
            } else {
                setToast("Erro ao votar");
            }
        } finally {
            setLoading(false);
        }
    };

    // Toast timeout
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(""), 3500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    if (loading) return <div className={styles.card}>Carregando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!poll) return null;

    const totalVotes = poll.votes.length;
    const results = poll.options.map(opt => ({
        option: opt,
        count: poll.votes.filter(v => v.option === opt).length,
    }));

    return (
        <div className={styles.container}>
            {toast && (
                <div className={styles.toast}>{toast}</div>
            )}
            <div className={styles.card}>
                {!voted && (
                    <button
                        className={styles.backBtn + " tw-back-btn"}
                        onClick={() => navigate("/")}
                        style={{ marginBottom: 16 }}
                    >
                        ← Voltar
                    </button>
                )}
                {poll.image && (
                    <img
                        src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${poll.image}`}
                        alt="Enquete"
                        className={styles.image}
                        style={{ maxWidth: "100%", width: "100%", objectFit: "cover", borderRadius: 8, marginBottom: 16 }}
                    />
                )}
                <h2 className={styles.title}>{poll.title}</h2>
                <div className={styles.desc}>{poll.description}</div>
                <div className={styles.date}>Expira em: {new Date(poll.expiresAt).toLocaleString()}</div>
                {voted && (
                    <>
                        <button
                            className={styles.backBtn}
                            onClick={() => navigate("/")}
                            style={{ marginBottom: 16 }}
                        >
                            ← Voltar para a Lista
                        </button>
                        <div className={styles.results}>
                            <h3 className={styles.title} style={{ fontSize: "1.1rem", marginBottom: 8 }}>Resultados:</h3>
                            <ul>
                                {results.map(r => (
                                    <li key={r.option} className={styles.resultRow}>
                                        <span>{r.option}</span>
                                        <span>{r.count} voto(s)</span>
                                        <span>{totalVotes > 0 ? ((r.count / totalVotes) * 100).toFixed(1) : 0}%</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.totalVotes}>Total de votos: {totalVotes}</div>
                        </div>
                    </>
                )}
                {!voted && (
                    <div className={styles.options}>
                        <h3 className={styles.title} style={{ fontSize: "1.1rem", marginBottom: 8 }}>Escolha uma opção:</h3>
                        <ul>
                            {poll.options.map(opt => (
                                <li key={opt} className={styles.optionRow}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <input
                                            type="radio"
                                            name="option"
                                            value={opt}
                                            checked={selected === opt}
                                            onChange={() => setSelected(opt)}
                                            disabled={voted}
                                            className={styles.radio}
                                        />
                                        {opt}
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <button
                            className={styles.button}
                            onClick={handleVote}
                            disabled={loading || !selected}
                        >
                            Votar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollDetails; 