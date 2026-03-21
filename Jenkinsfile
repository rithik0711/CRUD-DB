pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'crud-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Client') {
            steps {
                dir('client') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Server') {
            steps {
                dir('server') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Run Tests') {
            steps {
                // Add test commands if you have tests
                // For now, just a placeholder
                echo 'Running tests...'
                // sh 'npm test' in respective directories if tests exist
            }
        }

        stage('Deploy') {
            steps {
                // Add deployment steps here
                // For example, push to registry or deploy to server
                echo 'Deploying application...'
                // sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
    }

    post {
        always {
            // Clean up
            sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}