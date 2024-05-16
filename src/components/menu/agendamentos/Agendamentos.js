import React, { useState } from 'react';
import { TextField, MenuItem, Button, FormControl, InputLabel, Select, Typography } from '@mui/material';

function Agendamento() {
  const [categoria, setCategoria] = useState('');
  const [servico, setServico] = useState('');
  const [atendente, setAtendente] = useState('');
  const [data, setData] = useState('');

  const handleCategoriaChange = (event) => {
    setCategoria(event.target.value);
  };

  const handleServicoChange = (event) => {
    setServico(event.target.value);
  };

  const handleAtendenteChange = (event) => {
    setAtendente(event.target.value);
  };

  const handleDateChange = (event) => {
    setData(event.target.value);
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h6">Agendar Serviço</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Categoria</InputLabel>
        <Select value={categoria} label="Categoria" onChange={handleCategoriaChange}>
          <MenuItem value="massagem">Massagem</MenuItem>
          <MenuItem value="acupuntura">Acupuntura</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Serviço</InputLabel>
        <Select value={servico} label="Serviço" onChange={handleServicoChange}>
          <MenuItem value="relaxante">Relaxante</MenuItem>
          <MenuItem value="esportiva">Esportiva</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Atendente</InputLabel>
        <Select value={atendente} label="Atendente" onChange={handleAtendenteChange}>
          <MenuItem value="ana">Ana</MenuItem>
          <MenuItem value="joao">João</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Data"
        type="date"
        value={data}
        onChange={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" style={{ marginTop: 20 }}>
        Confirmar Agendamento
      </Button>
    </div>
  );
}

export default Agendamento;
