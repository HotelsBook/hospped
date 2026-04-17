# Configurações Gerais - Hospped
AUTHOR = 'Hospped'
SITENAME = 'Hospped'
SITESUBTITLE = 'by HotelsBook'
SITEURL = 'https://hotelsbook.github.io/hospped'

PATH = 'content'
OUTPUT_PATH = 'output'
THEME = 'theme'
TIMEZONE = 'America/Fortaleza'
DEFAULT_LANG = 'pt'
MARKUP = ('md',)

# CRÍTICO: Para GitHub Pages em subpasta
RELATIVE_URLS = True
DISPLAY_PAGES_ON_MENU = False

# Slugs
SLUGIFY_SOURCE = 'title'
SLUGIFY_SUBSTITUTE = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'ã': 'a', 'õ': 'o', 'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
    'ç': 'c', ' ': '-', '_': '-',
}

# Paleta Jade Imperial
COLORS = {
    'primary': '#2A5D5E',
    'primary_hover': '#1f4a4b',
    'accent': '#D4AF37',
    'accent_hover': '#b8962e',
    'bg': '#F0F0E9',
    'text': '#333333',
    'text_light': '#666666',
    'text_on_primary': '#FFFFFF',
    'text_on_accent': '#333333',
}

# Menu com links RELATIVOS
MENUITEMS = [
    ('Início', '/'),
    ('Serviços', '/servicos.html'),
    ('Sobre', '/sobre.html'),
    ('Contato', '/contato.html'),
]

# Arquivos estáticos
STATIC_PATHS = ['images', 'extra']
EXTRA_PATH_METADATA = {
    'extra/robots.txt': {'path': 'robots.txt'},
}

# SEO
DEFAULT_DESCRIPTION = 'Agência de reservas com atendimento humano e negociação direta.'

# Feeds
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

DEFAULT_PAGINATION = 10

# Configurações explícitas para páginas
PAGE_URL = '{slug}/'
PAGE_SAVE_AS = '{slug}/index.html'

# Ou alternativamente (mais simples):
# PAGE_URL = '{slug}.html'
# PAGE_SAVE_AS = '{slug}.html'

# Templates
TEMPLATE_VISIBLE_SETTINGS = {
    'SITENAME': SITENAME,
    'SITESUBTITLE': SITESUBTITLE,
    'SITEURL': SITEURL,
    'AUTHOR': AUTHOR,
    'COLORS': COLORS,
}