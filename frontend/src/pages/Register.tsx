import React, { useState } from "react";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

const Register = () => {
    const { register, loading } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");

        try {
            await register(name, email, password);
            navigate("/dashboard");
        } catch {
            setError("Erro ao registrar. Tente outro e-mail.");
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Criar Conta</h2>
                {error && <div className={styles.error}>{error}</div>}
                <input
                    type="text"
                    placeholder="Nome"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="E-mail"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className={styles.button}
                    disabled={loading}
                >
                    {loading ? "Criando..." : "Criar Conta"}
                </button>
                <div>
                    <a href="/login" className={styles.link}>Já tem conta? Entrar</a>
                </div>
            </form>
        </div>
    );
};

export default Register; 