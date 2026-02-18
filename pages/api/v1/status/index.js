function status (request, response) {

    response.status(200).json(
        {
            mensagem: "Ménsâgem cõm àcéntuáção"
        }
    )
}

export default status;