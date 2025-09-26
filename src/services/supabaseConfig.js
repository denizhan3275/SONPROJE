import { createClient } from '@supabase/supabase-js'

// Supabase yapılandırması
const supabaseUrl = 'https://axrpjarrsohcmcpwvldb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
export const registerUser = async (email, password, kullaniciAdi) => {
    try {
        // Kullanıcıyı kaydet
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: kullaniciAdi
                }
            }
        })

        if (authError) {
            let errorMessage = "Üye olma işlemi başarısız oldu."
            if (authError.message.includes('already registered')) {
                errorMessage = "Bu e-posta adresi zaten kullanımda."
            } else if (authError.message.includes('Password should be')) {
                errorMessage = "Şifre en az 6 karakter olmalıdır."
            }
            return { user: null, error: errorMessage }
        }

        // Kullanıcı bilgilerini users tablosuna kaydet
        if (authData.user) {
            const { error: dbError } = await supabase
                .from('users')
                .insert([
                    {
                        id: authData.user.id,
                        email: email,
                        kullanici_adi: kullaniciAdi,
                        kayit_tarihi: new Date().toISOString(),
                        son_giris_tarihi: new Date().toISOString()
                    }
                ])

            if (dbError) {
                console.error('Kullanıcı bilgileri kaydedilemedi:', dbError)
            }
        }

        return { user: authData.user, error: null }
    } catch (error) {
        console.error('Kayıt hatası:', error)
        return { user: null, error: "Beklenmeyen bir hata oluştu." }
    }
}

export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            let errorMessage = "Giriş işlemi başarısız oldu."
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = "E-posta veya şifre hatalı."
            }
            return { user: null, error: errorMessage }
        }

        // Son giriş tarihini güncelle
        if (data.user) {
            await supabase
                .from('users')
                .update({ son_giris_tarihi: new Date().toISOString() })
                .eq('id', data.user.id)
        }

        return { user: data.user, error: null }
    } catch (error) {
        console.error('Giriş hatası:', error)
        return { user: null, error: "Beklenmeyen bir hata oluştu." }
    }
}

export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) {
            return { error: "Çıkış işlemi başarısız oldu." }
        }
        return { error: null }
    } catch (error) {
        console.error('Çıkış hatası:', error)
        return { error: "Beklenmeyen bir hata oluştu." }
    }
}

// Kullanıcı bilgilerini getir
export const getKullaniciBilgileri = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            return { data: null, error: "Kullanıcı bilgileri bulunamadı." }
        }

        return { data, error: null }
    } catch (error) {
        console.error('Kullanıcı bilgileri getirme hatası:', error)
        return { data: null, error: "Kullanıcı bilgileri alınamadı." }
    }
}

// Favori hikaye işlemleri
export const getFavoriteStories = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('favorite_stories')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Favori hikayeler getirme hatası:', error)
            return { data: [], error: error.message }
        }

        return { data: data || [], error: null }
    } catch (error) {
        console.error('Favori hikayeler getirme hatası:', error)
        return { data: [], error: "Favori hikayeler alınamadı." }
    }
}

export const addFavoriteStory = async (userId, story) => {
    try {
        const { data, error } = await supabase
            .from('favorite_stories')
            .insert([
                {
                    user_id: userId,
                    content: story.content,
                    character: story.character || '',
                    story_name: story.storyName || '',
                    ai_responses: story.aiResponses || [],
                    created_at: new Date().toISOString()
                }
            ])
            .select()

        if (error) {
            console.error('Favori hikaye ekleme hatası:', error)
            return { data: null, error: error.message }
        }

        return { data: data[0], error: null }
    } catch (error) {
        console.error('Favori hikaye ekleme hatası:', error)
        return { data: null, error: "Favori hikaye eklenemedi." }
    }
}

export const updateFavoriteStory = async (storyId, updates) => {
    try {
        const { data, error } = await supabase
            .from('favorite_stories')
            .update(updates)
            .eq('id', storyId)
            .select()

        if (error) {
            console.error('Favori hikaye güncelleme hatası:', error)
            return { data: null, error: error.message }
        }

        return { data: data[0], error: null }
    } catch (error) {
        console.error('Favori hikaye güncelleme hatası:', error)
        return { data: null, error: "Favori hikaye güncellenemedi." }
    }
}

export const deleteFavoriteStory = async (storyId) => {
    try {
        const { error } = await supabase
            .from('favorite_stories')
            .delete()
            .eq('id', storyId)

        if (error) {
            console.error('Favori hikaye silme hatası:', error)
            return { error: error.message }
        }

        return { error: null }
    } catch (error) {
        console.error('Favori hikaye silme hatası:', error)
        return { error: "Favori hikaye silinemedi." }
    }
}

// Test skorları işlemleri
export const updateUserTestScore = async (userId, score) => {
    try {
        // Önce mevcut kullanıcı verilerini al
        const { data: userData, error: getUserError } = await supabase
            .from('users')
            .select('test_count, total_score')
            .eq('id', userId)
            .single()

        if (getUserError) {
            console.error('Kullanıcı verileri alınamadı:', getUserError)
            return { error: getUserError.message }
        }

        const testCount = (userData.test_count || 0) + 1
        const totalScore = (userData.total_score || 0) + parseFloat(score)
        const successRate = totalScore / testCount

        const { error } = await supabase
            .from('users')
            .update({
                test_count: testCount,
                total_score: totalScore,
                success_rate: successRate,
                last_test_date: new Date().toISOString()
            })
            .eq('id', userId)

        if (error) {
            console.error('Test skoru güncelleme hatası:', error)
            return { error: error.message }
        }

        return { error: null }
    } catch (error) {
        console.error('Test skoru güncelleme hatası:', error)
        return { error: "Test skoru güncellenemedi." }
    }
}

export const getAllUsersScores = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, kullanici_adi, test_count, success_rate')
            .order('test_count', { ascending: false })

        if (error) {
            console.error('Kullanıcı skorları getirme hatası:', error)
            return { data: [], error: error.message }
        }

        return { data: data || [], error: null }
    } catch (error) {
        console.error('Kullanıcı skorları getirme hatası:', error)
        return { data: [], error: "Kullanıcı skorları alınamadı." }
    }
}

export { supabase as auth }