import React, { useState } from "react";
import { useAuth } from "../store/AuthContext";
import { createPoll } from "../api/poll";
import { useNavigate } from "react-router-dom";
import styles from "./CreatePoll.module.css";

const CreatePoll = () => {
    const { accessToken } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [expiresAt, setExpiresAt] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleOptionChange = (i: number, value: string) => {
        setOptions(opts => opts.map((opt, idx) => idx === i ? value : opt));
    };

    const addOption = () => setOptions(opts => [...opts, ""]);
    const removeOption = (i: number) => setOptions(opts => opts.length > 2 ? opts.filter((_, idx) => idx !== i) : opts);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (options.filter(opt => opt.trim()).length < 2) {
            setError("Adicione pelo menos 2 opções");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            options.forEach(opt => formData.append("options", opt));
            formData.append("expiresAt", expiresAt);

            if (image) formData.append("image", image);

            await createPoll(accessToken!, formData);

            navigate("/dashboard");
        } catch {
            setError("Erro ao criar enquete");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Nova Enquete</h2>
                {error && <div className={styles.error}>{error}</div>}
                <input
                    className={styles.input}
                    placeholder="Título"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <textarea
                    className={styles.textarea}
                    placeholder="Descrição"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
                <div className={styles.options}>
                    <label className={styles.title} style={{ fontSize: "1.1rem", marginBottom: 8 }}>Opções</label>
                    {options.map((opt, i) => (
                        <div key={i} className={styles.optionRow}>
                            <input
                                className={styles.input}
                                value={opt}
                                onChange={e => handleOptionChange(i, e.target.value)}
                                required
                            />
                            {options.length > 2 && (
                                <button type="button" className={styles.removeBtn} onClick={() => removeOption(i)}>-</button>
                            )}
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={addOption}>Adicionar opção</button>
                </div>
                <input
                    type="datetime-local"
                    className={styles.input}
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handleImage}
                />

                {preview && <img src={preview} alt="Preview" className={styles.preview} />}

                <button className={styles.button} type="submit" disabled={loading}>
                    {loading ? "Criando..." : "Criar Enquete"}
                </button>
            </form>
        </div>
    );
};

export default CreatePoll; 