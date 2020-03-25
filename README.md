# k8s-leader-election-example
A simple node.js deployment example with leader-elector sidecars.

The leader elector sidecar container is based on the following example: https://github.com/kubernetes-retired/contrib/tree/master/election

# Requirements
This repository is tested with minikube v1.8.1. 

Service object is created with `type=NodePort`, so you need to enable NGINX Ingress Controller for minikube: 
`minikube addons enable ingress` 
 

