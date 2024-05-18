import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Modal, Paper, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";
import formatDate from "../../../utils/formatDate";
import formatPhone from "../../../utils/formatPhone";
import { useUser } from "../../../context/UserContext";
import PrintableDocument from './PrintableDocument';

const getBrazilTime = () => {
  const now = new Date();
  const timeZone = 'America/Sao_Paulo';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);
};

const ViewProntuarioModal = ({ prontuario, open, onClose }) => {
  const { user } = useUser();
  const [includeDateReceita, setIncludeDateReceita] = useState(false);
  const [includeDateExame, setIncludeDateExame] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [printIndex, setPrintIndex] = useState(0);
  const [printContentList, setPrintContentList] = useState([]);
    // eslint-disable-next-line
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    if (!prontuario) {
      console.error('Prontuário não definido');
    } else {
      console.log("Prontuário:", prontuario);
    }
  }, [prontuario]);

  useEffect(() => {
    console.log("User context:", user);
  }, [user]);

  const formatContentWithLineBreaks = (content) => {
    return content.replace(/(\d+)(-)/g, '\n$1$2');
  };

  const handleReimprimirReceita = () => {
    if (!prontuario || !prontuario.receitas) {
      console.error('Receituário não definido');
      return;
    }

    const formattedContent = prontuario.receitas.map(r => formatContentWithLineBreaks(r.value));

    setPrintData({
      titulo: 'Receita Médica',
      conteudo: formattedContent,
      paciente: prontuario.paciente,
      medico: { nome: user.nome, crm: user.identificacaoProfissional },
      includeDate: includeDateReceita
    });
  };

  const handleReimprimirExame = () => {
    if (!prontuario || !prontuario.exames) {
      console.error('Exames não definidos');
      return;
    }

    const formattedContent = prontuario.exames.map(e => formatContentWithLineBreaks(e.value));

    setPrintData({
      titulo: 'Pedido de Exame',
      conteudo: formattedContent,
      paciente: prontuario.paciente,
      medico: { nome: user.nome, crm: user.identificacaoProfissional },
      includeDate: includeDateExame
    });
  };

  const handleDocumentPrinted = (type) => {
    let printNote = `${type.charAt(0).toUpperCase() + type.slice(1)} impresso`;
    if (type === 'receita' && includeDateReceita) {
      printNote += ` em ${getBrazilTime()}`;
    } else if (type === 'exame' && includeDateExame) {
      printNote += ` em ${getBrazilTime()}`;
    }
    const currentNotes = prontuario.texto || '';
    const updatedNotes = currentNotes + '\n' + printNote;
    prontuario.texto = updatedNotes;

    if (printIndex + 1 < printContentList.length) {
      setPrintIndex(printIndex + 1);
    } else {
      setOpenPrintModal(false);
      setPrintIndex(0);
      setPrintContentList([]);
    }
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
    <>
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
          {prontuario.receitas?.length > 0 && (
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
              {prontuario.receitas?.length > 0 ? (
                prontuario.receitas.map((Receituário, index) => (
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
          )}
          {prontuario.exames?.length > 0 && (
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
          )}
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
      {printData && (
        <PrintableDocument
          ref={printRef}
          open={!!printData}
          onClose={() => setPrintData(null)}
          paciente={printData.paciente}
          conteudo={printData.conteudo}
          titulo={printData.titulo}
          medico={printData.medico}
          includeDate={printData.includeDate}
          onDocumentPrinted={() => handleDocumentPrinted(printData.titulo.toLowerCase())}
        />
      )}
    </>
  );
};

export default ViewProntuarioModal;
