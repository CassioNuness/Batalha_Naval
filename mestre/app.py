from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

app = Flask(__name__)
app.secret_key = 'segredo_super_secreto'  # Necessário para sessão

# Configuração do banco de dados PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root@localhost:5432/Batalha_Naval'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicialização do SQLAlchemy
db = SQLAlchemy(app)

# Modelo da tabela de jogadas
class Jogada(db.Model):
    __tablename__ = 'jogadas'
    id = db.Column(db.Integer, primary_key=True)
    jogador = db.Column(db.String(50))
    posicao = db.Column(db.String(10))
    resultado = db.Column(db.String(10))
    data_hora = db.Column(db.DateTime, default=db.func.now())

# Criação das tabelas no banco de dados (caso não existam)
with app.app_context():
    db.create_all()

# Teste de conexão ao banco de dados
try:
    with app.app_context():
        db.session.execute(text('SELECT 1'))
        print("✅ Conexão com o banco de dados estabelecida com sucesso!")
except Exception as e:
    print("❌ Erro ao conectar ao banco de dados:", e)

# Rota da tela inicial
@app.route('/')
def inicio():
    return render_template('inicio.html')

# Rota para iniciar o jogo (define jogadores na sessão)
@app.route('/iniciar', methods=['POST'])
def iniciar_jogo():
    session['jogador1'] = request.form['jogador1']
    session['jogador2'] = request.form['jogador2']

    # 🧹 Limpa as jogadas anteriores do banco de dados
    db.session.query(Jogada).delete()
    db.session.commit()

    return redirect(url_for('jogo'))

# Rota da tela de jogo
@app.route('/jogo')
def jogo():
    jogador1 = session.get('jogador1', 'Jogador 1')
    jogador2 = session.get('jogador2', 'Jogador 2')
    return render_template('jogo.html', jogador1=jogador1, jogador2=jogador2)

# Rota da tela de game over
@app.route('/gameover')
def gameover():
    return render_template('gameover.html')

# Rota da tela de vitória
@app.route('/vitoria')
def vitoria():
    return render_template('vitoria.html')

# Rota para salvar jogadas no banco de dados
@app.route('/salvar_jogada', methods=['POST'])
def salvar_jogada():
    jogador = request.form['jogador']
    posicao = request.form['posicao']
    resultado = request.form['resultado']
    
    nova_jogada = Jogada(jogador=jogador, posicao=posicao, resultado=resultado)
    db.session.add(nova_jogada)
    db.session.commit()
    
    return 'Jogada salva com sucesso!'

# Rota para carregar jogadas de um jogador (em JSON)
@app.route('/carregar_jogadas')
def carregar_jogadas():
    jogador = request.args.get('jogador')
    jogadas = Jogada.query.filter_by(jogador=jogador).all()
    resultado = [{'posicao': j.posicao, 'resultado': j.resultado} for j in jogadas]
    return jsonify(resultado)

# ✅ Nova rota para carregar todas as jogadas
@app.route('/carregar_todas_jogadas')
def carregar_todas_jogadas():
    jogadas = Jogada.query.order_by(Jogada.data_hora).all()
    resultado = [
        {
            'jogador': j.jogador,
            'posicao': j.posicao,
            'resultado': j.resultado
        } for j in jogadas
    ]
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)
