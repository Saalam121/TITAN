from flask import Flask, request, jsonify, render_template, Response
import subprocess
import os
import signal

app = Flask(__name__)
current_process = None


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/sslscan", methods=["POST"])
def scan():
    url = request.form.get("url")
    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        result = subprocess.run(
            ["sslyze", "--certinfo", url], capture_output=True, text=True
        )
        output = result.stdout
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    formatted_output = format_output(output)
    return jsonify({"result": formatted_output})


def format_output(output):
    return output.replace("\n", "<br>")


@app.route("/mhunt")
def mhunt_scan():
    global current_process
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "URL is required"}), 400

    wordlist_path = "./resources/fuzz2.txt"
    threads = 40

    command = [
        "feroxbuster",
        "-u",
        url,
        "-w",
        wordlist_path,
        "-s",
        "200",
        "-n",
        "-t",
        str(threads),
        "--silent",
    ]

    def generate():
        global current_process
        try:
            current_process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True,
            )

            for line in iter(current_process.stdout.readline, ""):
                yield f"data: {line.strip()}\n\n"
            current_process.stdout.close()
            return_code = current_process.wait()
            if return_code not in [0, -15]:
                error_output = current_process.stderr.read()
                yield f"data: Error: {error_output.strip()}\n\n"
        except Exception as e:
            yield f"data: Exception occurred: {str(e)}\n\n"
        finally:
            current_process = None

    return Response(generate(), mimetype="text/event-stream")


@app.route("/stop_scan")
def stop_scan():
    global current_process
    if current_process:
        try:
            current_process.terminate()
            current_process = None
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"status": "no process running"})


if __name__ == "__main__":
    app.run(debug=True)
