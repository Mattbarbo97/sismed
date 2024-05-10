import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import './PedidoExame.css';

const SolicitacaoExames = ({ open, onClose, onSave }) => {
  const [paciente, setPaciente] = useState('');
  const [exames, setExames] = useState('');
  const [motivo, setMotivo] = useState('');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Solicitação de Exames</DialogTitle>
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
          label="Exames Solicitados"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={exames}
          onChange={e => setExames(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Motivo"
          type="text"
          fullWidth
          variant="outlined"
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={() => onSave({ paciente, exames, motivo })}>Salvar Pedido de Exame</Button>
      <Button onClick={() => window.print()}>Imprimir</Button>
      </DialogActions>

    </Dialog>
  );
};

export default SolicitacaoExames;
