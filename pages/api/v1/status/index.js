import database from "infra/database.js";

async function status (request, response) {
    const result = await database.query('SELECT 1 + 1;');
    // console.log('result: ', result);
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