import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
} from "@mui/material";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import "./GerenciamentoFuncoes.css"; // Importe o arquivo CSS para estilização
import MenuPrincipal from "../menu/MenuPrincipal";

const GerenciamentoFuncoes = () => {
  const [funcoes, setFuncoes] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", ativo: false });

  const carregarFuncoes = async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "dbo.usuario"));
    const dadosFuncoes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFuncoes(dadosFuncoes);
  };

  useEffect(() => {
    carregarFuncoes();
  }, []);

  const alternarAtivacao = async (id, ativo) => {
    const db = getFirestore();
    await updateDoc(doc(db, "dbo.usuario", id), {
      ativo: !ativo,
    });
    const novasFuncoes = funcoes.map((funcao) =>
      funcao.id === id ? { ...funcao, ativo: !ativo } : funcao
    );
    setFuncoes(novasFuncoes);
  };

  const cadastrarNovoUsuario = async () => {
    const db = getFirestore();
    await addDoc(collection(db, "dbo.usuario"), novoUsuario);
    setNovoUsuario({ nome: "", ativo: false });
    carregarFuncoes();
  };

  const removerUsuario = async (id) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "dbo.usuario", id));
    const novasFuncoes = funcoes.filter((funcao) => funcao.id !== id);
    setFuncoes(novasFuncoes);
  };

  return (
    <Container className="usuarios-container">
      <MenuPrincipal />
      <Box className="usuarios-content">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Função</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {funcoes.map((funcao) => (
                <TableRow key={funcao.id}>
                  <TableCell>{funcao.nome}</TableCell>
                  <TableCell>
  <Box display="flex" alignItems="center" justifyContent="flex-end">
    <span>{funcao.ativo ? 'Ativado' : 'Desativado'}</span>
    <label className="switch" style={{ marginLeft: "8px" }}>
      <input
        type="checkbox"
        checked={funcao.ativo}
        onChange={() => alternarAtivacao(funcao.id, funcao.ativo)}
      />
      <span className="slider round"></span>
    </label>
    <Button className="removerBtn" variant="contained" color="secondary" onClick={() => removerUsuario(funcao.id)}>Remover</Button>
  </Box>
</TableCell>


                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
  <TextField
    label="Nome da nova função"
    value={novoUsuario.nome}
    onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
    style={{ width: "40vh" }}
  />
  <Button
    className="novoUsuarioBtn"
    variant="contained"
    color="primary"
    onClick={cadastrarNovoUsuario}
    style={{ width: "40vh" }}
  >
    Cadastrar Nova Função
  </Button>
</Box>



      </Box>
    </Container>
  );
};

export default GerenciamentoFuncoes;
