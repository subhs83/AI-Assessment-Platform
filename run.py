from smart_exam_system import create_app
import logging

app = create_app()
app.logger.setLevel(logging.INFO)

if __name__ == "__main__":
    app.run(debug=False)