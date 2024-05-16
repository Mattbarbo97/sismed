import React, { useEffect, useState } from 'react';
import { Box, Grid, Modal, Paper, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";
import formatDate from "../../../utils/formatDate";
import formatPhone from "../../../utils/formatPhone";
import { useUser } from "../../../context/UserContext";
import { useNavigate } from 'react-router-dom';

const ViewProntuarioModal = ({ prontuario, open, onClose }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [includeDateReceita, setIncludeDateReceita] = useState(false);
    const [includeDateExame, setIncludeDateExame] = useState(false);
    const [anotacoes, setAnotacoes] = useState('');

    useEffect(() => {
        if (!prontuario) {
            console.error('Prontuário não definido');
        } else {
            console.log("Prontuário:", prontuario);
        }
    }, [prontuario]);

    const handleUpdateAnotacoes = (tipo) => {
        const now = new Date();
        const timestamp = `${tipo} impresso em ${now.toLocaleString()}`;
        setAnotacoes((prev) => `${prev}\n${timestamp}`);
    };

    const handleReimprimirReceita = () => {
        if (!prontuario || !prontuario.Receituário) {
            console.error('Receituário não definido');
            return;
        }

        handleUpdateAnotacoes('Documento de Receituário');
        navigate('/printable-document', {
            state: {
                open: true,
                paciente: prontuario.paciente,
                conteudo: prontuario.Receituário.map(r => r.value),
                titulo: 'Receituário',
                medico: prontuario.medico,
                includeDate: includeDateReceita
            }
        });
    };

    const handleReimprimirExame = () => {
        if (!prontuario || !prontuario.exames) {
            console.error('Exames não definidos');
            return;
        }

        handleUpdateAnotacoes('Documento de Exame');
        navigate('/printable-document', {
            state: {
                open: true,
                paciente: prontuario.paciente,
                conteudo: prontuario.exames.map(e => e.value),
                titulo: 'Pedido de Exame',
                medico: prontuario.medico,
                includeDate: includeDateExame
            }
        });
    };

    if (!prontuario) {
        return (
            <Modal open={open} onClose={onClose}>
                <Paper
                    sx={{
                        position: "absolute",
                        bgcolor: "background.paper",
                        width: "80%",
                        p: 4,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <Box mb={2}>
                        <Typography
                            variant="h4"
                            align="center"
                            sx={{
                                fontSize: "1.5rem",
                            }}
                        >
                            Carregando...
                        </Typography>
                    </Box>
                </Paper>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Paper
                sx={{
                    position: "absolute",
                    bgcolor: "background.paper",
                    width: "80%",
                    p: 4,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                <Box mb={2}>
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            fontSize: "1.5rem",
                        }}
                    >
                        Prontuário {prontuario.id}
                    </Typography>
                </Box>
                <Box
                    mb={2}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5">
                        Informações do paciente:
                    </Typography>
                    <Grid
                        container
                        spacing={0}
                        sx={{
                            backgroundColor: "#f5f5f5",
                            padding: 2,
                            justifyContent: "space-between",
                            gap: 3,
                        }}
                    >
                        <Grid item xs="auto">
                            <Typography variant="body1">
                                <b>Nome:</b> {prontuario.paciente?.nome}
                            </Typography>
                        </Grid>
                        <Grid item xs="auto">
                            <Typography variant="body1">
                                <b>CPF:</b> {prontuario.paciente?.cpf}
                            </Typography>
                        </Grid>
                        <Grid item xs="auto">
                            <Typography variant="body1">
                                <b>Data de Nascimento:</b>{" "}
                                {formatDate(
                                    new Date(
                                        prontuario.paciente?.dataNascimento
                                    )
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs="auto">
                            <Typography variant="body1">
                                <b>Sexo:</b> {prontuario.paciente?.genero}
                            </Typography>
                        </Grid>
                        <Grid item xs="auto">
                            <Typography variant="body1">
                                <b>Telefone:</b>{" "}
                                {formatPhone(prontuario.paciente?.telefone)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box
                    mb={2}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5">
                        Detalhes do prontuário:
                    </Typography>
                    <Grid
                        container
                        spacing={0}
                        sx={{
                            backgroundColor: "#f5f5f5",
                            padding: 2,
                            justifyContent: "space-between",
                            gap: 3,
                        }}
                    >
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <b>Médico responsável:</b>{" "}
                                {prontuario.medico?.nome} 
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <b>CRM:</b> {prontuario.medico?.crm || user.identificacaoProfissional}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <b>Data da consulta:</b>{" "}
                                {formatDate(
                                    prontuario.data?.toDate() || new Date()
                                )}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box
                    mb={2}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5">
                        Receituário:
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReimprimirReceita}
                            sx={{ marginLeft: 2 }}
                        >
                            Imprimir Receita
                        </Button>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeDateReceita}
                                    onChange={(e) => setIncludeDateReceita(e.target.checked)}
                                />
                            }
                            label="Incluir data"
                        />
                    </Typography>
                    <Grid
                        container
                        spacing={0}
                        sx={{
                            backgroundColor: "#f5f5f5",
                            padding: 2,
                            justifyContent: "space-between",
                            gap: 3,
                        }}
                    >
                        {prontuario.Receituário?.length > 0 ? (
                            prontuario.Receituário.map((Receituário, index) => (
                                <Grid item xs={12} key={index}>
                                    <Typography variant="body1">
                                        <b>Receituário {index + 1}:</b>{" "}
                                        {Receituário.value}
                                    </Typography>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body1">
                                Nenhuma Receituário cadastrada
                            </Typography>
                        )}
                    </Grid>
                </Box>
                <Box
                    mb={2}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5">
                        Exames:
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReimprimirExame}
                            sx={{ marginLeft: 2 }}
                        >
                            Imprimir Exames
                        </Button>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeDateExame}
                                    onChange={(e) => setIncludeDateExame(e.target.checked)}
                                />
                            }
                            label="Incluir data"
                        />
                    </Typography>
                    <Grid
                        container
                        spacing={0}
                        sx={{
                            backgroundColor: "#f5f5f5",
                            padding: 2,
                            justifyContent: "space-between",
                            gap: 3,
                        }}
                    >
                        {prontuario.exames?.length > 0 ? (
                            prontuario.exames.map((exame, index) => (
                                <Grid item xs={12} key={index}>
                                    <Typography variant="body1">
                                        <b>Exame {index + 1}:</b> {exame.value}
                                    </Typography>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body1">
                                Nenhum exame cadastrado
                            </Typography>
                        )}
                    </Grid>
                </Box>
                <Box
                    mb={2}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5">Anotações Gerais:</Typography>
                    <Grid
                        container
                        spacing={0}
                        sx={{
                            backgroundColor: "#f5f5f5",
                            padding: 2,
                            justifyContent: "space-between",
                            gap: 3,
                        }}
                    >
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                {anotacoes}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Modal>
    );
};

export default ViewProntuarioModal;