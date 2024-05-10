import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography
} from '@mui/material';
//import './ReceitaMedica.css';  

const Receituario = ({ open, onClose, onSave }) => {
  const [paciente, setPaciente] = useState('');
  const [prescricoes, setPrescricoes] = useState('');
  const [observacoes, setObservacoes] = useState('');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Emissão de Receitas Médicas</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Dados do Paciente
        </Typography>
        <TextField
          margin="dense"
          label="Nome do Paciente"
          type="text"
          fullWidth
          variant="outlined"
          value={paciente}
          onChange={e => setPaciente(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Prescrições"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={prescricoes}
          onChange={e => setPrescricoes(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Observações"
          type="text"
          fullWidth
          variant="outlined"
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave({ paciente, prescricoes, observacoes })}>Salvar Receita</Button>
        <Button onClick={() => window.print()}>Imprimir</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Receituario;
