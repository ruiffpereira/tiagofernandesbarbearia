// Serviços e barbeiros da Barbearia Tiago Fernandes

export const SERVICES = [
  { id: 's1', name: 'Corte de Cabelo',    desc: 'Clássico ou moderno',   price: 15, icon: '✂️' },
  { id: 's2', name: 'Barba Completa',     desc: 'Aparar e definir',      price: 12, icon: '🪒' },
  { id: 's3', name: 'Corte + Barba',      desc: 'Serviço completo',      price: 24, icon: '💈' },
  { id: 's4', name: 'Degradê Premium',    desc: 'Acabamento a navalha',  price: 18, icon: '⭐' },
  { id: 's5', name: 'Tratamento Capilar', desc: 'Hidratação e styling',  price: 20, icon: '🌿' },
  { id: 's6', name: 'Sobrancelhas',       desc: 'Design e definição',    price: 8,  icon: '✦' },
]

export const BARBERS = [{ id: 'b1', name: 'Tiago Fernandes' }]

// Informação de contacto / negócio
export const BUSINESS = {
  name: 'Tiago Fernandes',
  tagline: 'Barbearia',
  address: ['Rua de Exemplo, 25', '4700-000 Braga'],
  phone: '+351 912 345 678',
  phoneHref: '+351912345678',
  hours: 'Ter–Sáb · 9h–12h · 13h–19h',
  socials: {
    instagram: '#',
    facebook: '#',
    whatsapp: '#',
  },
}

// Slot de marcação: 45 minutos. Horário: Ter–Sáb, 9h–12h e 13h–19h
export const SLOT_MINUTES = 45
