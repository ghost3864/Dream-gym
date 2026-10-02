const profileForm = document.querySelector('#profile-form');
const loginForm = document.querySelector('#login-form');
let activeProfile = null;

if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!profileForm.reportValidity()) {
            return;
        }

        const formData = new FormData(profileForm);
        const { email, senha, confirmar_senha, privacy_acknowledged, ...profile } = Object.fromEntries(formData.entries());
        const message = document.querySelector('#profile-message');

        if (senha !== confirmar_senha) {
            message.textContent = 'As senhas não coincidem. Verifique e tente novamente.';
            return;
        }

        message.textContent = 'Criando sua conta...';
        sessionStorage.setItem('dreamGymProfileDraft', JSON.stringify(profile));

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password: senha,
            options: {
            emailRedirectTo: `${window.location.origin}/perfil.html`
            }
        });

        if (error) {
            message.textContent = error.message;
            return;
        }

        if (data.session) {
            await saveProfileAndContinue(data.user, profile);
            return;
        }

        message.textContent = 'Conta criada. Confirme o e-mail recebido para concluir seu perfil.';
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!loginForm.reportValidity()) {
            return;
        }

        const message = document.getElementById('login-message');
        const formData = new FormData(loginForm);
        message.textContent = 'Entrando...';

        const { error } = await supabaseClient.auth.signInWithPassword({
            email: formData.get('email'),
            password: formData.get('senha')
        });

        if (error) {
            message.textContent = 'E-mail ou senha inválidos.';
            return;
        }

        const nextPage = new URLSearchParams(window.location.search).get('next');
        window.location.href = nextPage === 'recomendacao.html' ? nextPage : 'dashboard.html';
    });
}

document.querySelectorAll('[data-sign-out]').forEach((button) => {
    button.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        sessionStorage.removeItem('dreamGymProfileDraft');
        window.location.replace('login.html');
    });
});

initializeSession();

async function initializeSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        if (document.body.dataset.authRequired !== undefined) {
            const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
            window.location.replace(`login.html?next=${encodeURIComponent(currentPage)}`);
        }
        return;
    }

    const draftProfile = sessionStorage.getItem('dreamGymProfileDraft');

    if (draftProfile && profileForm) {
        await saveProfileAndContinue(session.user, JSON.parse(draftProfile));
        return;
    }

    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

    if (profile) {
        activeProfile = profile;
        renderProfile(profile);
        document.body.classList.add('access-authorized');
    } else if (document.body.dataset.profileRequired !== undefined) {
        window.location.replace('perfil.html');
    } else {
        document.body.classList.add('access-authorized');
    }
}

async function saveProfileAndContinue(user, profile) {
    const message = document.querySelector('#profile-message');
    const { error } = await supabaseClient.from('profiles').upsert({
        id: user.id,
        ...profile
    });

    if (error) {
        if (message) {
            message.textContent = `Não foi possível guardar o perfil: ${error.message}`;
        }
        return;
    }

    sessionStorage.removeItem('dreamGymProfileDraft');
    activeProfile = profile;
    const destination = profile.status_treino === 'treina-regularmente'
        ? 'dashboard.html'
        : 'recomendacao.html';
    window.location.href = destination;
}

function renderProfile(profile) {
    const name = profile.nome ? profile.nome.trim().split(' ')[0] : 'atleta';

    document.querySelectorAll('[data-user-name]').forEach((element) => {
        element.textContent = name;
    });

    const isBeginner = profile.status_treino !== 'treina-regularmente';
    const workoutPlan = getWorkoutPlan(profile.sexo, isBeginner);

    updateText('today-workout-title', workoutPlan.today.title);
    updateText('today-workout-description', workoutPlan.today.description);
    updateText('next-workout-title', workoutPlan.next.title);
    updateText('next-workout-description', workoutPlan.next.description);
    updateText('plan-title', workoutPlan.planTitle);
    updateText('plan-description', workoutPlan.planDescription);
}

function updateText(id, text) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = text;
    }
}

function getWorkoutPlan(sex, isBeginner) {
    if (sex === 'feminino' && isBeginner) {
        return {
            today: {
                title: 'Inferiores e glúteos',
                description: 'Pernas, glúteos e core com foco em técnica e adaptação.'
            },
            next: {
                title: 'Superiores',
                description: 'Costas, peito, ombros e braços em intensidade gradual.'
            },
            planTitle: 'Plano de adaptação feminino',
            planDescription: 'Uma rotina de 3 dias por semana, com ênfase inicial em inferiores e glúteos.'
        };
    }

    if (sex === 'masculino' && isBeginner) {
        return {
            today: {
                title: 'Corpo inteiro',
                description: 'Movimentos básicos para peito, costas, pernas, ombros e core.'
            },
            next: {
                title: 'Descanso ativo',
                description: 'Caminhada leve, mobilidade e recuperação para preparar o próximo treino.'
            },
            planTitle: 'Plano de adaptação geral',
            planDescription: 'Uma rotina de 3 dias por semana para desenvolver técnica e consistência antes de aumentar a divisão.'
        };
    }

    if (sex === 'feminino') {
        return {
            today: {
                title: 'Inferiores e glúteos',
                description: 'Quadríceps, posteriores, glúteos e core.'
            },
            next: {
                title: 'Superiores',
                description: 'Costas, ombros, peito e braços para equilibrar o desenvolvimento.'
            },
            planTitle: 'Divisão feminina',
            planDescription: 'Uma divisão com maior frequência de inferiores, ajustável conforme o seu objetivo.'
        };
    }

    if (sex === 'masculino') {
        return {
            today: {
                title: 'Peito, ombros e tríceps',
                description: 'Exercícios de empurrar para desenvolver a parte superior.'
            },
            next: {
                title: 'Costas e bíceps',
                description: 'Exercícios de puxar para equilibrar o treino de superiores.'
            },
            planTitle: 'Divisão masculina',
            planDescription: 'Uma divisão de superiores organizada para evoluir cargas e volume de forma progressiva.'
        };
    }

    return {
        today: {
            title: 'Corpo inteiro',
            description: 'Um treino equilibrado para parte superior, inferiores e core.'
        },
        next: {
            title: 'Inferiores e core',
            description: 'Pernas, glúteos e região abdominal com foco em estabilidade.'
        },
        planTitle: 'Divisão personalizada',
        planDescription: 'Uma base equilibrada que pode ser ajustada conforme os seus objetivos e preferências.'
    };
}

