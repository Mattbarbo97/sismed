import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, List, ListItem } from '@mui/material';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';



const ComponenteDePesquisa = () => {
  const [termoDePesquisa, setTermoDePesquisa] = useState('');
  const [filtro, setFiltro] = useState('nome');
  const [resultadosPesquisa, setResultadosPesquisa] = useState([]);

  const handleChangeTermoDePesquisa = (event) => {
    setTermoDePesquisa(event.target.value);
  };

  const handleChangeFiltro = (event) => {
    setFiltro(event.target.value);
  };

  const realizarPesquisa = async () => {
    const firestore = getFirestore();
    const collectionRef = collection(firestore, 'usuarios_cadastrados');
    const q = query(collectionRef, where(filtro, '==', termoDePesquisa));

    const querySnapshot = await getDocs(q);
    const resultados = querySnapshot.docs.map((doc) => doc.data());
    setResultadosPesquisa(resultados);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    realizarPesquisa();
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="filtro-label">Filtrar por</InputLabel>
        <Select
          labelId="filtro-label"
          id="filtro"
          value={filtro}
          label="Filtrar por"
          onChange={handleChangeFiltro}
        >
          <MenuItem value="nome">Nome</MenuItem>
          <MenuItem value="cpf">CPF</MenuItem>
          <MenuItem value="cidade">Cidade</MenuItem>
          <MenuItem value="email">Email</MenuItem>
          {/* Adicione mais opções de filtro conforme necessário */}
        </Select>
      </FormControl>
      <TextField
        label="Pesquisar"
        variant="outlined"
        value={termoDePesquisa}
        onChange={handleChangeTermoDePesquisa}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Pesquisar
      </Button>
      {/* Renderizar resultados da pesquisa */}
      <List>
        {resultadosPesquisa.map((resultado, index) => (
          <ListItem key={index}>
            {/* Renderize os detalhes do resultado como preferir */}
            {resultado.nome} - {resultado.email}
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default ComponenteDePesquisa;
