// Configuración
const CONFIG = {
    WEBHOOK_URL: "https://discord.com/api/webhooks/1307673448910295190/Sh7apv76n9kPhd_ZNO-Mm7_0Yh5ygmFiNFeri0p6UteBZvhj1uCt3Y2Z-D0WqivCbIEb",
    COLORS: {
        PRIMARY: 0xFF4655,
        SUCCESS: 0x43B581,
        ERROR: 0xF04747
    },
    MESSAGE_TIMEOUT: 3000
};

// Utilidades para validación y formateo
const Utils = {
    isEmpty: (value) => {
        return value === null || value === undefined || value.trim() === '';
    },
    
    formatDate: () => {
        return new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// Manejador de formulario
const FormHandler = {
    getRadioValue(name) {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio ? radio.value : null;
    },

    getCheckboxValues(name) {
        const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
        return checked.length > 0 ? checked : null;
    },

    getFieldValue(id) {
        const field = document.getElementById(id);
        if (!field) return null;
        return field.value.trim() || null;
    },

    collectFormData() {
        return {
            personalInfo: {
                discord: this.getFieldValue('nickname'),
                valorantID: this.getFieldValue('valorantID')
            },
            gameExperience: {
                rank: this.getFieldValue('rank'),
                playtime: this.getFieldValue('playtime'),
                roles: this.getCheckboxValues('roles')
            },
            serverFeedback: {
                events: this.getRadioValue('events'),
                communication: this.getRadioValue('communication'),
                staffResponse: this.getRadioValue('staffResponse'),
                toxicity: this.getFieldValue('toxicity')
            },
            preferences: {
                schedule: this.getCheckboxValues('schedule'),
                teamPreference: this.getFieldValue('teamPreference')
            },
            feedback: {
                staffComments: this.getFieldValue('staff'),
                channelSuggestions: this.getFieldValue('channels'),
                improvements: this.getFieldValue('improvements'),
                motivation: this.getFieldValue('motivation')
            }
        };
    }
};

// Generador de mensajes para Discord
const DiscordMessageBuilder = {
    createField(name, value, inline = false) {
        return {
            name,
            value: value || "No especificado",
            inline
        };
    },

    buildMessage(formData) {
        const embed = {
            title: "📊 Nueva Respuesta de Encuesta Valorant",
            color: CONFIG.COLORS.PRIMARY,
            fields: [],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Encuesta enviada el ${Utils.formatDate()}`
            }
        };

        // Sección: Información Personal
        embed.fields.push(
            this.createField("👤 Información Personal",
                `**Discord:** ${formData.personalInfo.discord}\n` +
                `**Valorant ID:** ${formData.personalInfo.valorantID}`
            )
        );

        // Sección: Experiencia en el Juego
        embed.fields.push(
            this.createField("🎮 Experiencia en el Juego",
                `**Rango:** ${formData.gameExperience.rank}\n` +
                `**Horas Semanales:** ${formData.gameExperience.playtime}\n` +
                `**Roles:** ${formData.gameExperience.roles?.join(", ")}`
            )
        );

        // Sección: Valoraciones del Servidor
        embed.fields.push(
            this.createField("⭐ Valoraciones",
                `**Eventos:** ${formData.serverFeedback.events}/5\n` +
                `**Comunicación:** ${formData.serverFeedback.communication}/5\n` +
                `**Respuesta Staff:** ${formData.serverFeedback.staffResponse}/5`
            )
        );

        // Sección: Preferencias y Horarios
        embed.fields.push(
            this.createField("🕒 Preferencias y Disponibilidad",
                `**Horarios:** ${formData.preferences.schedule?.join(", ")}\n` +
                `**Preferencia de Juego:** ${formData.preferences.teamPreference}\n` +
                `**Nivel de Toxicidad:** ${formData.serverFeedback.toxicity}`
            )
        );

        // Sección: Feedback y Sugerencias
        if (formData.feedback.staffComments) {
            embed.fields.push(this.createField("💭 Comentarios sobre el Staff", formData.feedback.staffComments));
        }
        if (formData.feedback.channelSuggestions) {
            embed.fields.push(this.createField("📌 Sugerencias de Canales", formData.feedback.channelSuggestions));
        }
        if (formData.feedback.improvements) {
            embed.fields.push(this.createField("💡 Sugerencias de Mejora", formData.feedback.improvements));
        }
        if (formData.feedback.motivation) {
            embed.fields.push(this.createField("🎯 Motivación para Participar", formData.feedback.motivation));
        }

        return {
            embeds: [embed]
        };
    }
};

// Manejador de UI
const UIHandler = {
    showSuccess() {
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'block';
        setTimeout(() => successMessage.style.display = 'none', CONFIG.MESSAGE_TIMEOUT);
    },

    showError(message) {
        alert(message);
    },

    resetForm(form) {
        form.reset();
    }
};

// API Service
const ApiService = {
    async sendToDiscord(payload) {
        try {
            const response = await fetch(CONFIG.WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            return true;
        } catch (error) {
            console.error("Error al enviar datos:", error);
            throw error;
        }
    }
};

// Inicialización y manejo de eventos
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Recolectar datos
            const formData = FormHandler.collectFormData();
            
            // Construir mensaje
            const payload = DiscordMessageBuilder.buildMessage(formData);
            
            // Enviar datos
            await ApiService.sendToDiscord(payload);
            
            // Manejar éxito
            UIHandler.showSuccess();
            UIHandler.resetForm(form);
        } catch (error) {
            UIHandler.showError("Hubo un error al enviar la encuesta. Por favor, intenta nuevamente.");
        }
    });
});