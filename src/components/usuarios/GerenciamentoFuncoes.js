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
  Tabs,
  Tab,
} from "@mui/material";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import "./GerenciamentoFuncoes.css"; // Importe o arquivo CSS para estilização
import MenuPrincipal from "../menu/MenuPrincipal";

const GerenciamentoFuncoes = () => {
  const [funcoes, setFuncoes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", ativo: true }); // Define ativo como true por padrão
  const [novaEspecialidade, setNovaEspecialidade] = useState({ nome: "", ativo: true }); // Define ativo como true por padrão
  const [tabIndex, setTabIndex] = useState(0);

  const carregarFuncoes = async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "dbo.usuario"));
    const dadosFuncoes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFuncoes(dadosFuncoes);
  };

  const carregarEspecialidades = async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "dbo.especialidades"));
    const dadosEspecialidades = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEspecialidades(dadosEspecialidades);
  };

  useEffect(() => {
    carregarFuncoes();
    carregarEspecialidades();
  }, []);

  const alternarAtivacaoFuncao = async (id, ativo) => {
    const db = getFirestore();
    await updateDoc(doc(db, "dbo.usuario", id), {
      ativo: !ativo,
    });
    const novasFuncoes = funcoes.map((funcao) =>
      funcao.id === id ? { ...funcao, ativo: !ativo } : funcao
    );
    setFuncoes(novasFuncoes);
  };

  const alternarAtivacaoEspecialidade = async (id, ativo) => {
    const db = getFirestore();
    await updateDoc(doc(db, "dbo.especialidades", id), {
      ativo: !ativo,
    });
    const novasEspecialidades = especialidades.map((especialidade) =>
      especialidade.id === id ? { ...especialidade, ativo: !ativo } : especialidade
    );
    setEspecialidades(novasEspecialidades);
  };

  const cadastrarNovoUsuario = async () => {
    const db = getFirestore();
    await addDoc(collection(db, "dbo.usuario"), novoUsuario);
    setNovoUsuario({ nome: "", ativo: true }); // Reseta o estado do novo usuário com ativo true por padrão
    carregarFuncoes();
  };

  const cadastrarNovaEspecialidade = async () => {
    const db = getFirestore();
    await addDoc(collection(db, "dbo.especialidades"), novaEspecialidade);
    setNovaEspecialidade({ nome: "", ativo: true }); // Reseta o estado da nova especialidade com ativo true por padrão
    carregarEspecialidades();
  };

  const removerUsuario = async (id) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "dbo.usuario", id));
    const novasFuncoes = funcoes.filter((funcao) => funcao.id !== id);
    setFuncoes(novasFuncoes);
  };

  const removerEspecialidade = async (id) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "dbo.especialidades", id));
    const novasEspecialidades = especialidades.filter((especialidade) => especialidade.id !== id);
    setEspecialidades(novasEspecialidades);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container className="usuarios-container">
      <MenuPrincipal />
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="Funções" />
        <Tab label="Especialidades" />
      </Tabs>
      <Box className="usuarios-content">
        {tabIndex === 0 && (
          <>
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
                              onChange={() => alternarAtivacaoFuncao(funcao.id, funcao.ativo)}
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
          </>
        )}
        {tabIndex === 1 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Especialidade</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {especialidades.map((especialidade) => (
                    <TableRow key={especialidade.id}>
                      <TableCell>{especialidade.nome}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <span>{especialidade.ativo ? 'Ativado' : 'Desativado'}</span>
                          <label className="switch" style={{ marginLeft: "8px" }}>
                            <input
                              type="checkbox"
                              checked={especialidade.ativo}
                              onChange={() => alternarAtivacaoEspecialidade(especialidade.id, especialidade.ativo)}
                            />
                            <span className="slider round"></span>
                          </label>
                          <Button className="removerBtn" variant="contained" color="secondary" onClick={() => removerEspecialidade(especialidade.id)}>Remover</Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
              <TextField
                label="Nome da nova especialidade"
                value={novaEspecialidade.nome}
                onChange={(e) => setNovaEspecialidade({ ...novaEspecialidade, nome: e.target.value })}
                style={{ width: "40vh" }}
              />
              <Button
                className="novaEspecialidadeBtn"
                variant="contained"
                color="primary"
                onClick={cadastrarNovaEspecialidade}
                style={{ width: "40vh" }}
              >
                Cadastrar Nova Especialidade
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default GerenciamentoFuncoes;
