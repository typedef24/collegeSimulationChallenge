# CollegeSimulationChallenge

This is an Angular powered app which simulates the activities of a college. App helps us to visualise the various thread processes running in the college.

You can access the live version of the application which is hosted on Vercel at [https://college-simulation-challenge.vercel.app/](https://college-simulation-challenge.vercel.app/)

The project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Local development with Docker

In case you have a different Angular version installed on your local computer or just don't want to install dependencies on your computer which can be very messy sometimes, you can as well run the project in a Docker container. I personally recommend this option. Assumming you have Docker Desktop installed and it's running, run:

```bash
docker compose watch
```

Docker will then create a virtual environment (container) and installs all the JS packages needed by the application, start the development server inside the container and expose port 4200 and you can then access the running application on your web browser at `http://localhost:4200/`
The application will automatically reload whenever you modify any of the source files.

### How to use the app

It's very simple.
- The running app displays a control panel at the top-left corner from which you can manipulate the simulation. You can manually populate the classrooms by clicking "Add Student", "Add Visitor" or "Add Lecturer" or make the simulation run automatically by clicking "▶️ Start" at the top-left corner, click "⏹ Stop" to stop the auto simulation. When in auto simulation mode, the system continuously adds students, visitors and lecturers to the classrooms and you can just watch or intervene manually if you wish.
- The Live Updates panel shows live text updates of all the actions taking place.
- At the bottom, you can see a visual representation of the classrooms at any point in time.