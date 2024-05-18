import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  createFilterOptions
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  runTransaction,
  setDoc
} from "firebase/firestore";
import { useUser } from "../../../context/UserContext";
import { format } from "date-fns";
import MenuPrincipal from "../MenuPrincipal";
import MedicalConsultationModal from "./MedicalConsultationModal";
import ViewProntuarioModal from "./viewProntuarioModal";
import PrintableDocument from "./PrintableDocument";
import "./ProntuarioStyles.css";

const formatDate = (date) => {
  try {
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error("Invalid date format:", date);
    return "";
  }
};

const formatDateTime = (date) => {
  try {
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error("Invalid date format:", date);
    return "";
  }
};

const takeFirst80Char = (text) => {
  if (!text) {
    console.error("text is undefined or null");
    return "";
  }
  return text.length > 80 ? text.substring(0, 80) + "..." : text;
};

const getNextProntuarioId = async () => {
  const db = getFirestore();
  const counterDocRef = doc(db, "counters", "prontuarioId");

  try {
    const newId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);
      if (!counterDoc.exists()) {
        transaction.set(counterDocRef, { currentId: 1 });
        return 1;
      }

      const currentId = counterDoc.data().currentId;
      const nextId = currentId + 1;
      transaction.update(counterDocRef, { currentId: nextId });

      return nextId;
    });

    return newId.toString().padStart(6, '0');
  } catch (e) {
    console.error("Transaction failed: ", e);
    throw e;
  }
};

const ProntuarioEletronico = () => {
  const [pacienteSelecionado, setPacienteSelecionado] = useState({
    id: "",
    nome: "",
    dataNascimento: "",
    genero: "",
    telefone: "",
    email: "",
    endereco: "",
    numeroResidencia: "",
    bairro: "",
    cidade: "",
    estado: ""
  });
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [modalConsultaAberto, setModalConsultaAberto] = useState(false);
  const [prontuarioSelecionado, setProntuarioSelecionado] = useState(null);
  const [viewProntuarioModal, setViewProntuarioModal] = useState(false);
  const [printData, setPrintData] = useState(null);

  const { user } = useUser();
  const printRef = useRef();

  useEffect(() => {
    const db = getFirestore();
    const pacientesCollection = collection(db, "pacientes_cadastrados");

    const listarPacientes = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(pacientesCollection);
        const pacientesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setPacientes(pacientesList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    listarPacientes();
  }, []);

  const salvarProntuario = async (data) => {
    if (!pacienteSelecionado.id) {
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      const novoId = await getNextProntuarioId();
      const dados = {
        id: novoId,
        texto: data.anotacoes,
        exames: data.exames,
        receitas: data.receitas,
        data: new Date(),
        paciente: pacienteSelecionado,
        user_id: pacienteSelecionado.id,
        medico: user
      };
      const historicoCollection = collection(db, "prontuarios");
      await setDoc(doc(historicoCollection, novoId), dados);
      setModalConsultaAberto(false);
      await buscarAnotacoes();
    } catch (error) {
      console.error("Erro ao salvar anotações:", error);
    }
    setLoading(false);
  };

  const buscarAnotacoes = useCallback(async () => {
    if (!pacienteSelecionado.id) {
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      const historicoCollection = collection(db, "prontuarios");
      const historicoSnapshot = await getDocs(historicoCollection);
      const historicoList = historicoSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((registro) => registro.user_id === pacienteSelecionado.id)
        .sort((a, b) => b.data.toDate() - a.data.toDate());
      setHistorico(historicoList);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, [pacienteSelecionado]);

  useEffect(() => {
    buscarAnotacoes();
  }, [pacienteSelecionado, buscarAnotacoes]);

  const defaultProps = {
    options: pacientes,
    getOptionLabel: (option) => {
      const dataNascimento = new Date(option.dataNascimento);
      return `${option.nome} (${formatDate(dataNascimento)})`;
    }
  };

  const defaultFilterOptions = createFilterOptions();
  const filterOptions = (options, state) => {
    return defaultFilterOptions(options, state).slice(0, 6);
  };

  const handlePrint = (titulo, conteudo) => {
    setPrintData({ titulo, conteudo });
  };

  return (
    <div className="prontuario-wrapper">
      <MenuPrincipal />
      <Box
        className="search-bar"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 1,
          maxWidth: "100%"
        }}
      >
        <Autocomplete
          {...defaultProps}
          id="paciente"
          clearOnEscape
          filterOptions={filterOptions}
          size="small"
          getOptionKey={(option) => option.id}
          limitTags={4}
          onChange={(e, value) => {
            if (!value) {
              setPacienteSelecionado({
                id: "",
                nome: "",
                dataNascimento: "",
                genero: "",
                telefone: "",
                email: "",
                endereco: "",
                numeroResidencia: "",
                bairro: "",
                cidade: "",
                estado: ""
              });
              setHistorico([]);
              return;
            }
            setPacienteSelecionado(value);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Paciente" variant="standard" />
          )}
          sx={{
            width: "100%"
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setModalConsultaAberto(true)}
          disabled={!pacienteSelecionado.id}
        >
          Novo Atendimento
        </Button>
      </Box>
      <Paper
        className="informacoes-paciente"
        sx={{
          padding: 2
        }}
      >
        <Typography
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold"
          }}
        >
          Informações do Paciente
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2
              }}
            >
              <Typography variant="h6">Nome:</Typography>
              <Typography variant="h6">{pacienteSelecionado.nome}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2
              }}
            >
              <Typography variant="h6">Data de Nascimento:</Typography>
              <Typography variant="h6">
                {formatDate(new Date(pacienteSelecionado.dataNascimento))}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2
              }}
            >
              <Typography variant="h6">Genero:</Typography>
              <Typography variant="h6">{pacienteSelecionado.genero}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2
              }}
            >
              <Typography variant="h6">Telefone:</Typography>
              <Typography variant="h6">
                {pacienteSelecionado.telefone}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2
              }}
            >
              <Typography variant="h6">E-mail:</Typography>
              <Typography variant="h6">{pacienteSelecionado.email}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">
              Endereço: {pacienteSelecionado.endereco} -{" "}
              {pacienteSelecionado.numeroResidencia} -{" "}
              {pacienteSelecionado.bairro} - {pacienteSelecionado.cidade} -{" "}
              {pacienteSelecionado.estado}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="Histórico do Prontuário">
          <TableHead>
            <TableRow>
              <TableCell>Data e Hora</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historico.map((registro) => (
              <TableRow key={registro.id}>
                <TableCell>{formatDateTime(registro.data.toDate())}</TableCell>
                <TableCell>{registro.medico.nome}</TableCell>
                <TableCell>
                  {takeFirst80Char(registro.texto || "")}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setProntuarioSelecionado(registro);
                      setViewProntuarioModal(true);
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <MedicalConsultationModal
        open={modalConsultaAberto}
        paciente={pacienteSelecionado}
        doutor={user}
        onClose={() => setModalConsultaAberto(false)}
        handleSave={salvarProntuario}
      />

      {prontuarioSelecionado && (
        <ViewProntuarioModal
          prontuario={prontuarioSelecionado}
          open={viewProntuarioModal}
          onClose={() => setViewProntuarioModal(false)}
        />
      )}

      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      )}

      {printData && (
        <PrintableDocument
          ref={printRef}
          open={!!printData}
          onClose={() => setPrintData(null)}
          paciente={pacienteSelecionado}
          conteudo={printData.conteudo}
          titulo={printData.titulo}
          medico={user}
          includeDate={true}
          onDocumentPrinted={(titulo) => console.log(`${titulo} impresso`)}
        />
      )}
    </div>
  );
};

export default ProntuarioEletronico;
