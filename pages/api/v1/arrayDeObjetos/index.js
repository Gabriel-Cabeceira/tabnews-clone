function status (request, response) {

    response.status(200).json(
        {
            clientes: [
                {
                    sobrenome: 'Gonçalves'
                },
                {
                    sobrenome: 'Ribeiro'
                },
                {
                    nome: 'Gabriel',
                    sobrenome: 'Cabeceira'
                }
            ]
        }
    )
}

export default status;