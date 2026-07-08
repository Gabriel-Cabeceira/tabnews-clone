function status (request, response) {

    response.status(200).json(
        {
            cliente: {
                sobrenome: 'Gonçalves'
            }
        }
    )
}

export default status;