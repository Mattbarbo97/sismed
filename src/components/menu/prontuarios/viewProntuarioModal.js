import { Box, Grid, Modal, Paper, Typography } from "@mui/material";
import formatDate from "../../../utils/formatDate";
import formatPhone from "../../../utils/formatPhone";

const ViewProntuarioModal = ({ prontuario, open, onClose }) => {
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
                        Prontuario {prontuario.id}
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
                                <b>Medico responsável:</b>{" "}
                                {prontuario.medico?.name}
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
                    <Typography variant="h5">Receituario:</Typography>
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
                        {prontuario.receitas?.length > 0 ? (
                            prontuario.receitas.map((receita, index) => (
                                <Grid item xs={12} key={index}>
                                    <Typography variant="body1">
                                        <b>Receita {index + 1}:</b>{" "}
                                        {receita.value}
                                    </Typography>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body1">
                                Nenhuma receita cadastrada
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
                    <Typography variant="h5">Exames:</Typography>
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
                                {prontuario.texto}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Modal>
    );
};

export default ViewProntuarioModal;
