const supabase = require("../config/supabase.js")

const uploadToSupabase = async (file) => {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`

    const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        })

    if (error) throw error

    const { data } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(fileName)

    return data.publicUrl
}

module.exports = uploadToSupabase