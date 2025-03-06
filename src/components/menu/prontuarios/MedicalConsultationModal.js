/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box, Button, IconButton, Modal, Paper, Typography, TextField, InputAdornment, Checkbox, FormControlLabel, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PrintableDocument from './PrintableDocument';
import { format } from 'date-fns';
import { useUser } from '../../../context/UserContext';
import { storage, db } from "../../../firebase"; // Importando o firebase storage e firestore configurado
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import ReceituarioControleEspecial from './ReceituarioControleEspecial';
import OdontogramaModal from './Odontograma/OdontogramaModal';

const timeZone = 'America/Sao_Paulo';

function getBrazilTime() {
  const now = new Date();
  return format(now, 'dd/MM/yyyy');
}

const validationSchema = Yup.object().shape({
  receitas: Yup.array().of(
    Yup.object().shape({
      value: Yup.string().required("O campo não pode estar vazio, se não for preencher, remova o campo."),
    })
  ),
  exames: Yup.array().of(
    Yup.object().shape({
      value: Yup.string().required("O campo não pode estar vazio, se não for preencher, remova o campo."),
    })
  ),
  anotacoes: Yup.string().required("As Evoluções são obrigatórias."),
});

const MedicalConsultationModal = ({ open, onClose, paciente, handleSave }) => {
  const { user } = useUser();
  const [receitaCounter, setReceitaCounter] = useState(0);
  const [exameCounter, setExameCounter] = useState(0);
  const [openOdontograma, setOpenOdontograma] = useState(false);

  const [confirmClear, setConfirmClear] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
const [printContentList, setPrintContentList] = useState([]);
const [printIndex, setPrintIndex] = useState(0);
const [printTitle, setPrintTitle] = useState('');

// ✅ Adicionando estado para o Receituário de Controle Especial
const [isReceituarioControleEspecial, setIsReceituarioControleEspecial] = useState(false);
const [openReceituarioControleModal, setOpenReceituarioControleModal] = useState(false);

  const [enableFileField, setEnableFileField] = useState(false);
  const [file, setFile] = useState(null);
  const [fileCaption, setFileCaption] = useState("");
  const [openFileModal, setOpenFileModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  


  useEffect(() => {
    const fetchDocuments = async () => {
      if (paciente?.id) {
        const patientRef = doc(db, "prontuarios", paciente.id);
        const patientSnap = await getDoc(patientRef);
        if (patientSnap.exists()) {
          const patientData = patientSnap.data();
          if (patientData.documentos) {
            setDocuments(patientData.documentos);
          }
        }
      }
    };

    if (open) {
      fetchDocuments();
    }
  }, [open, paciente?.id]);

  
  const formik = useFormik({
    initialValues: {
      receitas: [],
      exames: [],
      anotacoes: "",
      dataAtendimento: getBrazilTime(),
      horaAtendimento: getBrazilTime(),
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
    setIsUploading(true);
    setErrorMessage("");
    let fileUrl = null;

    try {
      // Realiza o upload do arquivo, se existir
      if (file) {
        console.log("Uploading file...");
        const formattedDate = format(new Date(values.dataAtendimento), "yyyy-MM-dd");
        fileUrl = await uploadFileToFirebase(file, paciente.id, formattedDate);
        console.log("File uploaded successfully:", fileUrl);
      }

      console.log("Salvando documento no Firestore...");

      const patientRef = doc(db, "prontuarios", paciente.id);
      
      // Usa setDoc para criar ou atualizar o documento
      await setDoc(patientRef, {
        documentos: arrayUnion({
          fileUrl: fileUrl,
          fileCaption: fileCaption,
          fileName: file?.name || "",
          fileType: file?.type || "",
          dataUpload: new Date().toISOString(),
        }),
      }, { merge: true }); // Com merge: true, não sobrescrevemos outros campos

      console.log("Documento salvo com sucesso no Firestore");

      handleSave({ ...values, fileUrl, fileCaption, paciente });
      formik.resetForm();
      setFile(null);
      setFileCaption("");
    } catch (error) {
      console.error("Erro ao salvar o prontuário:", error);
      setErrorMessage("Erro ao salvar o prontuário. Verifique sua conexão e tente novamente.");
    } finally {
      setIsUploading(false);
    }
  },
});
  

  const handleKeyDown = (event, field, index) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      let updatedValue = formik.values[field][index].value;
      const lines = updatedValue.split('\n');
      const newLineNumber = lines.length + 1;
      updatedValue += `\n${newLineNumber}- `;
      formik.setFieldValue(`${field}[${index}].value`, updatedValue);
    }
  };

  const handleDeleteReceita = (index) => {
    const newReceitas = [...formik.values.receitas];
    newReceitas.splice(index, 1);
    formik.setFieldValue("receitas", newReceitas);
  };

  const addReceita = () => {
    const newReceita = { value: "1- ", key: `receita-${receitaCounter}` };
    formik.setFieldValue("receitas", [...formik.values.receitas, newReceita]);
    setReceitaCounter(receitaCounter + 1);
  };
  
  const handleDenteSelecionado = (dente) => {
    formik.setFieldValue("anotacoes", formik.values.anotacoes + ` Dente ${dente},`);
  };
  

  const handleDeleteExame = (index) => {
    const newExames = [...formik.values.exames];
    newExames.splice(index, 1);
    formik.setFieldValue("exames", newExames);
  };

  const addExame = () => {
    const newExame = { value: "1- ", key: `exame-${exameCounter}` };
    formik.setFieldValue("exames", [...formik.values.exames, newExame]);
    setExameCounter(exameCounter + 1);
  };

  const imprimirReceita = () => {
    const formattedPrescriptions = formik.values.receitas.map(r => r.value.replace(/\n/g, '<br>'));
    setPrintTitle('Receita Médica');
    setPrintContentList(formattedPrescriptions);
    setOpenPrintModal(true);
  };

  const handlePrint = () => {
    const printNote = `${printTitle.charAt(0).toUpperCase() + printTitle.slice(1)} impresso em ${getBrazilTime()}`;
    const currentNotes = formik.values.anotacoes;
    const updatedNotes = currentNotes + '\n' + printNote;
    formik.setFieldValue('anotacoes', updatedNotes);
    setOpenPrintModal(false);
  };

  const imprimirExames = () => {
    const formattedExams = formik.values.exames.map(e => e.value.replace(/\n/g, '<br>'));
    setPrintTitle('Pedido de Exame');
    setPrintContentList(formattedExams);
    setOpenPrintModal(true);
  };

  const handlePrintModalClose = () => {
    setOpenPrintModal(false);
    setPrintIndex(0);
    setPrintContentList([]);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };




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
      

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}


          <form onSubmit={formik.handleSubmit}>
           
           

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Evolução</Typography>
            <Button variant="contained" onClick={() => setOpenOdontograma(true)}>
              Odontograma
            </Button>
          </Box>

            <TextField
              label="Anotações"
              value={formik.values.anotacoes}
              name="anotacoes"
              onChange={formik.handleChange}
              error={formik.touched.anotacoes && Boolean(formik.errors.anotacoes)}
              helperText={formik.touched.anotacoes && formik.errors.anotacoes}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              margin="normal"
            />

            <Box className="subtle-line"></Box>


          


            <Typography variant="h6">Pedidos de Exames</Typography>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ marginBottom: 2 }}>
              {formik.values.exames.map((exame, index) => (
                <TextField
                  key={exame.key}
                  value={exame.value}
                  name={`exames[${index}].value`}
                  onChange={formik.handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'exames', index)}
                  error={formik.touched.exames && Boolean(formik.errors.exames)}
                  helperText={formik.touched.exames && formik.errors.exames}
                  fullWidth
                  multiline
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="delete field"
                          onClick={() => handleDeleteExame(index)}
                          edge="end"
                        >
                          <CancelIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ))}
              <IconButton onClick={addExame}>
                <AddIcon />
              </IconButton>
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={imprimirExames}
                >
                  Imprimir Exames
                </Button>
              </Box>
            </Box>

            <Typography variant="h6">Receitas</Typography>

            <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ marginBottom: 2 }}>
  {formik.values.receitas.map((receita, index) => (
    <TextField
      key={receita.key}
      value={receita.value}
      name={`receitas[${index}].value`}
      onChange={formik.handleChange}
      onKeyDown={(e) => handleKeyDown(e, 'receitas', index)}
      error={formik.touched.receitas && Boolean(formik.errors.receitas)}
      helperText={formik.touched.receitas && formik.errors.receitas}
      fullWidth
      multiline
      variant="outlined"
      margin="normal"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="delete field"
              onClick={() => handleDeleteReceita(index)}
              edge="end"
            >
              <CancelIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  ))} 
</Box> {/* ✅ Aqui fechamos corretamente o primeiro Box */} 

{/* ✅ Agora criamos um novo Box para os botões e o "+" */}
<Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
  <IconButton onClick={addReceita}>
    <AddIcon />
  </IconButton>

  <Box display="flex" alignItems="center" gap={2} sx={{ mt: 2 }}>
    <FormControlLabel
      control={
        <Checkbox
          checked={isReceituarioControleEspecial}
          onChange={() => setIsReceituarioControleEspecial(!isReceituarioControleEspecial)}
        />
      }
      label="Receituário de Controle Especial"
    />

<Button
  variant="contained"
  sx={{
    backgroundColor: "#8B5E3C",
    color: "#fff",
    "&:hover": { backgroundColor: "#6A4329" }
  }}
  onClick={() => {
    if (isReceituarioControleEspecial) {
      setOpenReceituarioControleModal(true); // ✅ Abre o modal do Receituário de Controle Especial
    } else {
      imprimirReceita(); // ✅ Continua imprimindo a receita normal se não for controle especial
    }
  }}
>
  Imprimir Receita
</Button>

  </Box>
</Box> {/* ✅ Fechamento correto do Box dos botões */}

           
                   
          

         

            <FormControlLabel
              control={
                <Checkbox
                  checked={enableFileField}
                  onChange={() => setEnableFileField((prev) => !prev)}
                />
              }
              label="Adicionar Arquivo"
            />
            {enableFileField && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  padding: 2
                }}
              >
                <TextField
                  type="file"
                  onChange={handleFileUpload}
                  variant="standard"
                />
                {file && (
                  <>
                    <Typography>{file.name}</Typography>
                    <TextField
                      label="Legenda do Arquivo"
                      value={fileCaption}
                      onChange={(e) => setFileCaption(e.target.value)}
                      variant="standard"
                    />
                  </>
                )}
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isUploading} // Desabilitar botão enquanto estiver carregando
              >
                {isUploading ? <CircularProgress size={24} /> : "Salvar Prontuário"}
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#f44336",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                  }
                }}
                onClick={() => setConfirmClear(true)}
                disabled={isUploading} // Desabilitar botão enquanto estiver carregando
              >
                Limpar tudo
              </Button>
            </Box>
          </form>
          <OdontogramaModal
           open={openOdontograma}
           onClose={() => setOpenOdontograma(false)}
           onDenteSelecionado={handleDenteSelecionado}
         />

        </Paper>
      </Modal>

      <Modal open={confirmClear}>
        <Paper
          sx={{
            position: "absolute",
            bgcolor: "background.paper",
            width: "40%",
            p: 4,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6" align="center">
            Tem certeza que deseja limpar tudo?
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              color: "#f44336",
              opacity: 0.8,
              marginBottom: 4,
            }}
          >
            Essa ação não pode ser desfeita
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              marginTop: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                formik.resetForm();
                setConfirmClear(false);
              }}
            >
              Sim
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f44336",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                }
              }}
              onClick={() => setConfirmClear(false)}
            >
              Não
            </Button>
          </Box>
        </Paper>
      </Modal>

      {printContentList.length > 0 && (
  <PrintableDocument
    open={openPrintModal}
    onClose={handlePrintModalClose}
    paciente={paciente}
    conteudo={printContentList}
    titulo={printTitle}
    medico={{ nome: user?.nome, crm: user?.identificacaoProfissional }}
    includeDate={true}
    onDocumentPrinted={() => handlePrint()}
  />
)}


<ReceituarioControleEspecial
  open={openReceituarioControleModal}
  onClose={() => setOpenReceituarioControleModal(false)}
  paciente={paciente}
  conteudo={formik.values.receitas.map(r => r.value.replace(/\n/g, '<br>'))}
  titulo="Receituário de Controle Especial"
  medico={{ nome: user?.nome, crm: user?.identificacaoProfissional }}
  includeDate={true}
  onDocumentPrinted={() => setOpenReceituarioControleModal(false)}
  tipoDocumento="receituario_controle"
/>


      <Box className="subtle-line"></Box>
      <Typography variant="h6">Documentos do Paciente</Typography>
      <Box sx={{ marginBottom: 2 }}>
        {documents.length > 0 ? (
          documents.map((doc, index) => (
            <Box key={index} display="flex" flexDirection="column" alignItems="flex-start" gap={1} sx={{ marginBottom: 2 }}>
              <Typography><strong>Nome do Arquivo:</strong> {doc.fileName}</Typography>
              <Typography><strong>Legenda:</strong> {doc.fileCaption}</Typography>
              <Button
                variant="outlined"
                onClick={() => window.open(doc.fileUrl, "_blank")}
              >
                Ver Documento
              </Button>
            </Box>
          ))
        ) : (
          <Typography>Nenhum documento adicionado.</Typography>
        )}
      </Box>

      <Modal open={openFileModal} onClose={() => setOpenFileModal(false)}>
        <Paper
          sx={{
            position: "absolute",
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <embed src={file} type="application/pdf" width="100%" height="600px" />
        </Paper>
      </Modal>
    </>
  );
};

export default MedicalConsultationModal;

const uploadFileToFirebase = async (file, pacienteId, dataAtendimento) => {
  try {
    const date = new Date(dataAtendimento).toISOString().split('T')[0];
    const storageRef = ref(storage, `prontuarios/${pacienteId}/${date}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw new Error("Não foi possível fazer upload do arquivo");
  }
};

