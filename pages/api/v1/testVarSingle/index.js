function status (request, response) {

    response.status(200).json(
        {
            paciente: {
                codigoOperadora: '1'
            }
        }
    )
}

export default status;
