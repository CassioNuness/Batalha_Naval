from PIL import Image
import os

# Caminho das imagens
caminho_imagens = 'mestre/static/img'
formato_destino = 'png'

# Cria uma nova pasta para as imagens convertidas
pasta_saida = os.path.join(caminho_imagens, 'convertidas')
os.makedirs(pasta_saida, exist_ok=True)

# Extensões permitidas
extensoes_validas = ['.jpg', '.jpeg', '.png', '.bmp']

for nome_arquivo in os.listdir(caminho_imagens):
    caminho_arquivo = os.path.join(caminho_imagens, nome_arquivo)
    
    if not os.path.isfile(caminho_arquivo):
        continue  # pula subpastas
    
    nome, ext = os.path.splitext(nome_arquivo.lower())
    if ext in extensoes_validas:
        try:
            imagem = Image.open(caminho_arquivo).convert("RGBA")
            novo_nome = f"{nome}.{formato_destino}"
            novo_caminho = os.path.join(pasta_saida, novo_nome)
            imagem.save(novo_caminho, formato_destino.upper())
            print(f'✔ {nome_arquivo} -> {novo_nome}')
        except Exception as e:
            print(f'❌ Erro ao converter {nome_arquivo}: {e}')
