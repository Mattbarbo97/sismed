/* eslint-disable */
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
  createFilterOptions,
  Modal
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from '@mui/icons-material/Add';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc
} from "firebase/firestore";
import { useUser } from "../../../context/UserContext";
import { format } from "date-fns";
import MenuPrincipal from "../MenuPrincipal";
import MedicalConsultationModal from "./MedicalConsultationModal";
import ViewProntuarioModal from "./viewProntuarioModal";
import PrintableDocument from "./PrintableDocument";
import "./ProntuarioStyles.css";

// Funções utilitárias para formatar datas
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

// Função para sincronizar localStorage
const sincronizarLocalStorage = (paciente) => {
  if (!paciente || !paciente.nome || !paciente.dataNascimento) {
    localStorage.removeItem("pacienteNome");
    return;
  }

  const dataNascimento = formatDate(new Date(paciente.dataNascimento));
  const pacienteFormatado = `${paciente.nome} (nasc.: ${dataNascimento})`;
  localStorage.setItem("pacienteNome", pacienteFormatado);
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
    estado: "",
    numeroProntuario: ""
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

  // Passo 1: Carregar os pacientes do Firebase
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

  // Passo 2: Usar o paciente salvo no localStorage para selecionar automaticamente
  useEffect(() => {
    if (pacientes.length > 0) {
      const pacienteSalvo = localStorage.getItem("pacienteNome");

      if (pacienteSalvo && pacienteSalvo !== "undefined") {
        try {
          const pacienteEncontrado = pacientes.find((paciente) => {
            const dataNascimento = formatDate(new Date(paciente.dataNascimento));
            const nomeFormatado = `${paciente.nome} (nasc.: ${dataNascimento})`;
            return nomeFormatado === pacienteSalvo;
          });

          if (pacienteEncontrado) {
            setPacienteSelecionado(pacienteEncontrado);
          } else {
            console.warn("Paciente salvo no localStorage não foi encontrado.");
          }
        } catch (error) {
          console.error("Erro ao buscar paciente no localStorage:", error);
        }
      }
    }
  }, [pacientes]);

  const salvarProntuario = async (data) => {
    if (!pacienteSelecionado.id) {
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      const dados = {
        texto: data.anotacoes,
        exames: data.exames,
        receitas: data.receitas,
        data: new Date(),
        paciente: pacienteSelecionado,
        user_id: pacienteSelecionado.id,
        medico: user
      };
      const historicoCollection = collection(db, "prontuarios");
      await setDoc(doc(historicoCollection), dados);
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
      return `${option.nome} (nasc.: ${formatDate(dataNascimento)})`;
    }
  };

  const defaultFilterOptions = createFilterOptions();
  const filterOptions = (options, state) => {
    return defaultFilterOptions(options, state).slice(0, 6);
  };

  return (
    <div className="prontuario-wrapper">
      <MenuPrincipal />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 1 }}>
        <Autocomplete
          {...defaultProps}
          id="paciente"
          clearOnEscape
          filterOptions={filterOptions}
          size="small"
          value={pacienteSelecionado.id ? pacienteSelecionado : null}
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
                estado: "",
                numeroProntuario: ""
              });
              setHistorico([]);
              localStorage.removeItem("pacienteNome");
              return;
            }

            sincronizarLocalStorage(value);
            setPacienteSelecionado(value);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Paciente" variant="standard" />
          )}
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

      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6">Informações do Paciente</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>Nome: {pacienteSelecionado.nome}</Typography>
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
                <TableCell>{takeFirst80Char(registro.texto || "")}</TableCell>
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
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
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
          onDocumentPrinted={(titulo) => console.log(`${titulo} impresso`)}
        />
      )}
    </div>
  );
};

export default ProntuarioEletronico;
