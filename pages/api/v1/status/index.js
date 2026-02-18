function status (request, response) {

    response.status(200).json(
        {
            mensagem: "Ménsâgem cõm àcéntuáção",
            emojis: "😬🤐",
            emoji_hexadecimal_1: "##1f604##",
            emoji_hexadecimal_2: "##1f602##"
        }
    )
}

export default status;