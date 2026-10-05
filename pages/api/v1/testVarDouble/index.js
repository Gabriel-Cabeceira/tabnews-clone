function status (request, response) {

    response.status(200).json(
        {
            paciente: {
                codigoOperadora: [
                    { codigo: '1' },
                    { codigo: '1' }
                ]
            }
        }
    )
}

export default status;
