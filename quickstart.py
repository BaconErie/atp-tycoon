from flask import Flask, send_file

app = Flask(__name__, template_folder='./')

@app.route("/<path:file>")
def hello_world(file):
    return send_file(file)

if __name__ == '__main__':
    app.run()