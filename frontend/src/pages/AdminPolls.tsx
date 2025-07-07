import React, { useEffect, useState } from "react";
import { useAuth } from "../store/AuthContext";
import api from "../api/axios";
import { getUserPolls } from "../api/poll";
import type { Poll } from "../types";
import styles from "./AdminPolls.module.css";

const AdminPolls = () => {
    const { accessToken, user } = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        console.log("user: ", user);
        if (!accessToken) return;

        setLoading(true);
        if (user?.isAdmin) {
            api.get<Poll[]>("/admin/polls", {
                params: { search },
                headers: { Authorization: `Bearer ${accessToken}` },
            })
                .then(res => setPolls(res.data))
                .catch(() => setError("Erro ao carregar enquetes"))
                .finally(() => setLoading(false));
        } else {
            getUserPolls(accessToken, 1, search)
                .then(res => setPolls(res.data))
                .catch(() => setError("Erro ao carregar enquetes"))
                .finally(() => setLoading(false));
        }
    }, [accessToken, user, search]);

    const filtered = polls.filter(poll => {
        if (status === "active") return !poll.closed && new Date(poll.expiresAt) > new Date();
        if (status === "expired") return poll.closed || new Date(poll.expiresAt) < new Date();
        return true;
    });

    const closePoll = async (id: string) => {
        if (!accessToken) return;

        setLoading(true);

        try {
            await api.post(`/polls/${id}/close`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setPolls(polls => polls.map(p => p.id === id ? { ...p, closed: true } : p));
        } catch {
            setError("Erro ao fechar enquete");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Admin - Todas as Enquetes</h2>
                <div className={styles.searchBar}>
                    <input
                        className={styles.input}
                        placeholder="Buscar enquetes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">Todas</option>
                        <option value="active">Ativas</option>
                        <option value="expired">Expiradas/Fechadas</option>
                    </select>
                </div>
                {loading ? (
                    <div>Carregando enquetes...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : filtered.length === 0 ? (
                    <div className={styles.empty}>Nenhuma enquete encontrada.</div>
                ) : (
                    <ul className={styles.pollList}>
                        {filtered.map((poll) => (
                            <li key={poll.id} className={styles.pollItem}>
                                <div className={styles.pollTitle}>{poll.title}</div>
                                <div className={styles.pollDesc}>{poll.description}</div>
                                <div className={styles.pollDate}>Expira em: {new Date(poll.expiresAt).toLocaleString()}</div>
                                <div className={styles.status}>Status: {poll.closed || new Date(poll.expiresAt) < new Date() ? "Expirada/Fechada" : "Ativa"}</div>
                                {!poll.closed && new Date(poll.expiresAt) > new Date() && (
                                    <button className={styles.closeBtn} onClick={() => closePoll(poll.id)}>Fechar enquete</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminPolls; 