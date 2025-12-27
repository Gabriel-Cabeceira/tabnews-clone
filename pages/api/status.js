function status (request, response) {

    response.status(200).json(
        {
            mensagem: "Top demais!"
        }
    )
}

export default status;