import React, { useState } from 'react';
import {
  Box, Button, IconButton, Modal, Paper, Typography, InputAdornment, TextField, FormControlLabel, Checkbox
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
  return formatInTimeZone(now, timeZone, 'dd/MM/yyyy HH:mm:ssXXX');
}

const validationSchema = Yup.object().shape({
  Receituário: Yup.array().of(
    Yup.object().shape({
      value: Yup.string().required("O campo não pode estar vazio, se não for preencher, remova o campo."),
    })
  ),
  exames: Yup.array().of(
    Yup.object().hape({
      value: Yup.string().required("O campo não pode estar vazio, se não for preencher, remova o campo."),
    })
  ),
  anotacoes: Yup.string().required("As anotações da consulta são obrigatórias."),
});

const MedicalConsultationModal = ({ open, onClose, paciente, handleSave }) => {
  const { user } = useUser();
  const [ReceituárioCounter, setReceituárioCounter] = useState(0);
  const [exameCounter, setExameCounter] = useState(0);
  // eslint-disable-next-line
  const [confirmClear, setConfirmClear] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [printContentList, setPrintContentList] = useState([]);
  const [printTitle, setPrintTitle] = useState('');
  // eslint-disable-next-line
  const [isMultiple, setIsMultiple] = useState(false);
  const [includeDate, setIncludeDate] = useState(true); // Estado para controlar a opção de incluir data

  const formik = useFormik({
    initialValues: {
      Receituário: [],
      exames: [],
      anotacoes: "",
      dataAtendimento: getBrazilTime(),
      horaAtendimento: getBrazilTime()
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSave(values);
      formik.resetForm();
    },
  });

  const handleKeyDown = (event, field, index) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentValue = formik.values[field][index].value.trim();
      if (currentValue !== "") {
        const lines = currentValue.split('\n');
        const lastLine = lines[lines.length - 1];
        const lastNumber = parseInt(lastLine.split('-')[0].trim(), 10);
        const newLineNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
        const newValue = `${currentValue}\n${newLineNumber}- `;
        formik.setFieldValue(`${field}[${index}].value`, newValue);
      }
    }
  };

  const handleDocumentPrinted = (documentType) => {
    const currentNotes = formik.values.anotacoes;
    const printNote = `Documento de ${documentType} impresso em ${getBrazilTime()}`;
    const updatedNotes = currentNotes + '\n' + printNote;
    formik.setFieldValue('anotacoes', updatedNotes);
  };

  const handleDeleteReceituário = (index) => {
    const newReceituário = [...formik.values.Receituário];
    newReceituário.splice(index, 1);
    formik.setFieldValue("Receituário", newReceituário);
  };

  const addReceituário = () => {
    const newReceituário = { value: "1- ", key: `Receituário-${ReceituárioCounter}` };
    formik.setFieldValue("Receituário", [...formik.values.Receituário, newReceituário]);
    setReceituárioCounter(ReceituárioCounter + 1);
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

  const imprimirReceituário = () => {
    const formattedPrescriptions = formik.values.Receituário.map((r) => `${r.value}`);
    setPrintTitle('Receituário');
    setPrintContentList(formattedPrescriptions.map(p => p.replace(/\n/g, '<br>')));
    setIsMultiple(true);
    handleDocumentPrinted('Receituário');
    setOpenPrintModal(true);
  };

  const imprimirExames = () => {
    const formattedExams = formik.values.exames.map((e) => `${e.value}`);
    setPrintTitle('Solicitação de exame');
    setPrintContentList(formattedExams.map(e => e.replace(/\n/g, '<br>')));
    setIsMultiple(true);
    handleDocumentPrinted('Solicitação de exame');
    setOpenPrintModal(true);
  };

  const handlePrintModalClose = () => {
    setOpenPrintModal(false);
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
            <Typography variant="h6">Receituário</Typography>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              {formik.values.Receituário.map((Receituário, index) => (
                <TextField
                  key={Receituário.key}
                  label={`Receituário ${index + 1}`}
                  value={Receituário.value}
                  onChange={(e) => formik.setFieldValue(`Receituário[${index}].value`, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'Receituário', index)}
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleDeleteReceituário(index)}><CancelIcon /></IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ))}
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Button startIcon={<AddIcon />} onClick={addReceituário} variant="contained" sx={{ flex: 1, marginRight: 1 }}>Adicionar Receituário</Button>
                <Button startIcon={<AddIcon />} onClick={imprimirReceituário} variant="contained" sx={{ flex: 1, marginRight: 1 }}>Imprimir Receituário</Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeDate}
                      onChange={(e) => setIncludeDate(e.target.checked)}
                      name="includeDate"
                      color="primary"
                    />
                  }
                  label="Incluir data"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>Pedidos de Exame</Typography>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              {formik.values.exames.map((exame, index) => (
                <TextField
                  key={exame.key}
                  label={`Exame ${index + 1}`}
                  value={exame.value}
                  onChange={(e) => formik.setFieldValue(`exames[${index}].value`, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'exames', index)}
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleDeleteExame(index)}><CancelIcon /></IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ))}
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Button startIcon={<AddIcon />} onClick={addExame} variant="contained" sx={{ flex: 1, marginRight: 1 }}>Adicionar Exame</Button>
                <Button startIcon={<AddIcon />} onClick={imprimirExames} variant="contained" sx={{ flex: 1, marginRight: 1 }}>Imprimir Solicitação de exame</Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeDate}
                      onChange={(e) => setIncludeDate(e.target.checked)}
                      name="includeDate"
                      color="primary"
                    />
                  }
                  label="Incluir data"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mt: 2 }}>
              <Typography variant="h6">Anotações da Consulta</Typography>
              <TextField
                label="Anotações da Consulta"
                value={formik.values.anotacoes}
                onChange={(e) => formik.setFieldValue('anotacoes', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'anotacoes')}
                multiline
                rows={8}
                variant="outlined"
                fullWidth
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={formik.handleSubmit}
                fullWidth
              >
                Salvar Atendimento
              </Button>
              <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={onClose}
                fullWidth
              >
                Cancelar
              </Button>
            </Box>
          </form>
        </Paper>
      </Modal>

      <PrintableDocument
        open={openPrintModal}
        onClose={handlePrintModalClose}
        paciente={paciente}
        conteudo={printContentList}
        titulo={printTitle}
        medico={{ nome: user.nome, crm: user.identificacaoProfissional }}
        onDocumentPrinted={handleDocumentPrinted}
        isMultiple={true}
        includeDate={includeDate} // Passa a opção de incluir data para o componente PrintableDocument
      />
    </>
  );
};

export default MedicalConsultationModal;
