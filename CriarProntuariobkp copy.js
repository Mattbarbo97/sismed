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
    numeroProntuario: "" // Adiciona o campo número de prontuário
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
      return `${option.nome} (${formatDate(dataNascimento)})`;
    }
  };

  const defaultFilterOptions = createFilterOptions();
  const filterOptions = (options, state) => {
    return defaultFilterOptions(options, state).slice(0, 6);
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
                estado: "",
                numeroProntuario: "" // Reseta o campo número de prontuário
              });
              setHistorico([]);
              return;
            }
            console.log("Número de Prontuário Selecionado:", value.numeroProntuario);
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
          padding: 2,
          width: '50%' // Reduza a largura do campo de informações do paciente
        }}
      >
        <Typography
          style={{
            fontSize: "1.2rem", // Diminua o tamanho da fonte do título
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
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>Nome:</Typography> {/* Diminua o tamanho da fonte */}
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>{pacienteSelecionado.nome}</Typography>
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
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>Data de Nascimento:</Typography>
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>
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
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>Genero:</Typography>
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>{pacienteSelecionado.genero}</Typography>
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
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>Telefone:</Typography>
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>{pacienteSelecionado.telefone}</Typography>
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
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>E-mail:</Typography>
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>{pacienteSelecionado.email}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" style={{ fontSize: '0.9rem' }}>
              Endereço: {pacienteSelecionado.endereco} -{" "}
              {pacienteSelecionado.numeroResidencia} -{" "}
              {pacienteSelecionado.bairro} - {pacienteSelecionado.cidade} -{" "}
              {pacienteSelecionado.estado}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2
              }}
            >
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>Número de Prontuário:</Typography>
              <Typography variant="body1" style={{ fontSize: '0.9rem' }}>
                {pacienteSelecionado.numeroProntuario}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Modal
  open={modalConsultaAberto}
  onClose={() => setModalConsultaAberto(false)}
  className="modal"
>
  <Paper className="modal-content">
    <Typography variant="h6">Novo Atendimento</Typography>
    <Typography variant="subtitle1">Paciente: {pacienteSelecionado.nome}</Typography>
    <Formik
      initialValues={{
        anotacoes: "",
        exames: [],
        receitas: [],
        arquivo: null, // Inicializa como nulo
      }}
      validate={(values) => {
        const errors = {};
        if (!values.anotacoes) {
          errors.anotacoes = "As anotações são obrigatórias.";
        }
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // Prepara os dados para salvar
          const data = {
            anotacoes: values.anotacoes || "Sem anotações",
            exames: values.exames || [],
            receitas: values.receitas || [],
            arquivo: values.arquivo || null, // Certifique-se de tratar o arquivo como opcional
          };

          // Salva o prontuário
          await salvarProntuario(data);
          setSubmitting(false);
          setModalConsultaAberto(false); // Fecha o modal após salvar
        } catch (error) {
          console.error("Erro ao salvar o prontuário:", error);
          setSubmitting(false);
        }
      }}
    >
      {({ values, handleChange, handleSubmit, setFieldValue, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <Typography variant="h6">Evolução</Typography>
            <TextField
              name="anotacoes"
              label="Anotações"
              value={values.anotacoes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
            <ErrorMessage
              name="anotacoes"
              component="div"
              style={{ color: "red", fontSize: "0.8rem" }}
            />
          </Box>
          <Box mb={2}>
            <Typography variant="h6">Receitas</Typography>
            <Button variant="outlined" color="primary" onClick={() => {}}>
              Adicionar Receita
            </Button>
          </Box>
          <Box mb={2}>
            <Typography variant="h6">Pedidos de Exames</Typography>
            <Button variant="outlined" color="primary" onClick={() => {}}>
              Adicionar Exame
            </Button>
          </Box>
          <Box mb={2}>
            <Typography variant="h6">Arquivo</Typography>
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files ? event.target.files[0] : null;
                setFieldValue("arquivo", file); // Atualiza o arquivo no estado do Formik
              }}
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setModalConsultaAberto(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  </Paper>
</Modal>



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
          onDocumentPrinted={(titulo) => console.log(`${titulo} impresso`)}
        />
      )}
    </div>
  );
};

export default ProntuarioEletronico;
