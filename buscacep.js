import axios from 'axios';

const buscarEnderecoPorCep = async (cep) => {
  if (cep.length === 8) {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.data.erro) {
        setEndereco(response.data.logradouro);
        // Adicione aqui mais campos se necessário, como bairro, cidade, etc.
      } else {
        Alert.alert('Erro', 'CEP não encontrado.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro ao buscar o CEP.');
    }
  }
};
