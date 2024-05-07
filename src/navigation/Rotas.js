//Rotas.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm';
import Home from '../components/paginas/Home';
import UsuariosCadastrados from '../components/usuarios/UsuariosCadastrados';
import CadastroUsuario from '../components/usuarios/CadastroUsuario';
import CadastroPaciente from '../components/menu/pacientes/CadastroPaciente';
import PacientesCadastrados from '../components/menu/pacientes/PacientesCadastrados'; // Importe o componente VisualizarPacientes
import ProntuarioEletronico from '../components/menu/prontuarios/CriarProntuario';

function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/home" element={<Home />} />
      <Route path="/usuarios-cadastrados" element={<UsuariosCadastrados />} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
      <Route path="/cadastro-paciente" element={<CadastroPaciente />} />
      <Route path="/pacientes-cadastrados" element={<PacientesCadastrados />} /> 
      <Route  path="/criar-prontuario" element={<ProntuarioEletronico/>} />
      {/* Outras rotas conforme necessário */}
    </Routes>
  );
}

export default Rotas;
