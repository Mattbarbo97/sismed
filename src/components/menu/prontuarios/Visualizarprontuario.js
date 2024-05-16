import React, { useEffect, useState, useContext } from 'react';
import ProntuarioEletronico from './ProntuarioEletronico';
import { db } from '../firebase'; // Ajuste o caminho conforme necessário
import { UserContext } from '../context/UserContext'; // Ajuste o caminho conforme necessário
import { collection, getDocs } from 'firebase/firestore';

const VisualizarProntuario = () => {
  const [paciente, setPaciente] = useState(null);
  const [medico, setMedico] = useState(null);
  const { user } = useContext(UserContext); // Se estiver usando um contexto para o usuário

  useEffect(() => {
    const fetchDados = async () => {
      try {
        // Recupere os dados do paciente baseado no usuário logado, se aplicável
        const pacienteRef = collection(db, 'pacientes');
        // Aqui você adiciona sua lógica de consulta, por exemplo, buscar pelo ID do usuário
        const pacienteData = await getDocs(pacienteRef);
        const pacienteInfo = pacienteData.docs.map((doc) => ({ ...doc.data(), id: doc.id }))[0];
        setPaciente(pacienteInfo);

        // Recupere os dados do médico, se necessário
        const medicoRef = collection(db, 'medicos');
        // Adicione sua lógica de consulta, por exemplo, buscar pelo ID
        const medicoData
= await getDocs(medicoRef);
const medicoInfo = medicoData.docs.map((doc) => ({ ...doc.data(), id: doc.id }))[0];
setMedico(medicoInfo);
} catch (error) {
console.error("Erro ao buscar dados: ", error);
}
};


fetchDados();
}, [user]);

// Agora, você pode passar 'paciente' e 'medico' para o componente ProntuarioEletronico como props
return (
<div>
{paciente && medico ? (
<ProntuarioEletronico paciente={paciente} medico={medico} />
) : (
<p>Carregando dados...</p>
)}
</div>
);
};

export default VisualizarProntuario;