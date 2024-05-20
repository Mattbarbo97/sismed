import React, { useState } from 'react';
import {
  // eslint-disable-next-line
  Box, Button, IconButton, Modal, Paper, Typography, TextField, InputAdornment, Checkbox, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PrintableDocument from './PrintableDocument';
import { formatInTimeZone } from 'date-fns-tz';
import { useUser } from '../../../context/UserContext';

const timeZone = 'America/Sao_Paulo';

function getBrazilTime() {
  const now = new Date();
  return formatInTimeZone(now, timeZone, 'dd/MM/yyyy');
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
  anotacoes: Yup.string().required("As anotações da consulta são obrigatórias."),
});

const MedicalConsultationModal = ({ open, onClose, paciente, handleSave }) => {
  const { user } = useUser();
  const [receitaCounter, setReceitaCounter] = useState(0);
  const [exameCounter, setExameCounter] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [printContentList, setPrintContentList] = useState([]);
  const [printIndex, setPrintIndex] = useState(0);
  const [printTitle, setPrintTitle] = useState('');

  const formik = useFormik({
    initialValues: {
      receitas: [],
      exames: [],
      anotacoes: "",
      dataAtendimento: getBrazilTime(),
      horaAtendimento: getBrazilTime()
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // Converte as quebras de linha HTML para quebras de linha de texto
      values.receitas = values.receitas.map(receita => ({
        ...receita,
        value: receita.value.replace(/<br>/g, '\n')
      }));
      values.exames = values.exames.map(exame => ({
        ...exame,
        value: exame.value.replace(/<br>/g, '\n')
      }));
      
      handleSave(values);
      formik.resetForm();
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

  const handleDocumentPrinted = (type) => {
    const printNote = `${type.charAt(0).toUpperCase() + type.slice(1)} impresso em ${getBrazilTime()}`;
    const currentNotes = formik.values.anotacoes;
    const updatedNotes = currentNotes + '\n' + printNote;
    formik.setFieldValue('anotacoes', updatedNotes);

    if (printIndex + 1 < printContentList.length) {
      setPrintIndex(printIndex + 1);
    } else {
      setOpenPrintModal(false);
      setPrintIndex(0);
      setPrintContentList([]);
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
          <Typography variant="h6" style={{ textAlign: "center" }}>Novo Atendimento</Typography>
          <Typography variant="subtitle1">Paciente: {paciente.nome}</Typography>
          <form onSubmit={formik.handleSubmit}>
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
              <IconButton onClick={addReceita}>
                <AddIcon />
              </IconButton>
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={imprimirReceita}
                >
                  Imprimir Receita
                </Button>
              </Box>
            </Box>

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

            <Box className="subtle-line"></Box>
            <Typography variant="h6">Anotações da Consulta</Typography>
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
              >
                Salvar Prontuário
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#f44336",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                  },
                }}
                onClick={() => setConfirmClear(true)}
              >
                Limpar tudo
              </Button>
            </Box>
          </form>
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
                },
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
          includeDate={true}  // Definindo como true para sempre incluir a data
          onDocumentPrinted={() => handleDocumentPrinted(printTitle.toLowerCase())}
        />
      )}
    </>
  );
};

export default MedicalConsultationModal;
