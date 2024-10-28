import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography
} from '@mui/material';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

function VerificarAgendamentos() {
  const [open, setOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    const carregarAgendamentos = async () => {
      try {
        const agendamentosSnapshot = await getDocs(collection(db, 'agendamentos'));
        const agendamentosList = agendamentosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAgendamentos(agendamentosList);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      }
    };

    carregarAgendamentos();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Verificar Agendamentos
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agendamentos</DialogTitle>
        <DialogContent>
          {agendamentos.length > 0 ? (
            agendamentos.map((agendamento) => (
              <Box key={agendamento.id} marginBottom={2}>
                <Typography variant="body1">
                  Paciente: {agendamento.pacienteNome}
                </Typography>
                <Typography variant="body2">
                  Profissional: {agendamento.profissionalId}
                </Typography>
                <Typography variant="body2">
                  Data: {agendamento.data}
                </Typography>
                <Typography variant="body2">
                  Horário(s): {agendamento.horario}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">Nenhum agendamento encontrado.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Envolvendo os elementos JSX adjacentes em um fragmento */}
      <Box className="legenda-container">
        <Typography variant="h6">Legenda:</Typography>
        <Box className="legenda">
          <Box className="legenda-item">
            {/* Conteúdo da legenda aqui */}
            <Typography variant="body2">Item 1: Descrição do item 1</Typography>
          </Box>
          <Box className="legenda-item">
            <Typography variant="body2">Item 2: Descrição do item 2</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default VerificarAgendamentos;
