# k8s-leader-election-example
A simple node.js deployment example with leader-elector sidecars running in minikube cluster. 

The leader elector sidecar container is based on the following example: https://github.com/kubernetes-retired/contrib/tree/master/election

## Prerequisites
* Minikube: This repository is tested with minikube v1.8.1.  
* Internet access from your minikube VM & docker images. 
 
## Installation 
Start your local cluster. 
```
minikube start
````


### Create a new service account
Create a new service account named leader-elector for the app. 

```
kubectl apply -f leader-elector-sa.yaml
```

Verify that the newly created service account exists.
```
kubectl get serviceaccount leader-elector
```

### Create a new ClusterRole
Sidecar containers need access to K8s API resources (e.g. Endpoint) that are not allowed by default. This cluster role will prove access to them. 
```
kubectl apply -f leader-elector-clusterrole.yaml
```

Verify the cluster role creation and see the affected resources via: 
```
kubectl describe clusterrole leader-elector
```
> You would like to see here "get create delete patch update" verbs for Endpoints resource.


### Create a new ClusterRoleBinding 
Bind the cluster role to the new service account.
```
kubectl apply -f leader-elector-clusterrolebinding.yaml
```
Verify resource creation.
```
kubectl describe clusterrolebinding leader-elector
```
### Deploy app
Deploy the leader-elector app with 3 pod ReplicaSet.
```
kubectl apply -f leader-elector-deployment.yaml
```
Verify deployment. 
> Completion might take couple of mins for the first time.
```
kubectl get deployment -n default
```

### Create Service object
Service object uses `type=NodePort` to expose service via External IP. 

```
kubectl apply -f leader-elector-service.yaml
```

Check the details of the created Service. 
```
kubectl describe service leader-elector-service
```

### Access to the service 

You can visit the service from the `NodeIp:NodePort`. You can obtain the URL via: 
```
minikube service leader-elector-service --url
``` 
or directly open the exposed service in your default browser via
```
minikube service leader-elector-service
```

Whe you open the URL in your browser, you are expected to see the following page. 

![web-gui-example](/img/web-sample.png)


## Testing
If an unexpected condition occurs for the current leader, the group will choose a new leader immediately. First identify the existing leader via your browser. Then you can test the recovery as follows: 
```
kubectl delete pod leader-elector-<leader-pod-id>
```

Deployment will automatically replace the deleted pod, but in between another node will claim the leader role. You can check it via your exposed service URL or from the Endpoint object (name=example) that sidecar containers are accessing for leader selection logic. 

```
kubectl get endpoints example -o json
```

Expected output is similar to the following. 
```json
{
  "apiVersion": "v1",
  "kind": "Endpoints",
  "metadata": {
    "annotations": {
      "control-plane.alpha.kubernetes.io/leader": "{\"holderIdentity\":\"leader-elector-7cbdd6bcc5-z79jc\",\"leaseDurationSeconds\":10,\"acquireTime\":\"2020-03-26T16:42:37Z\",\"renewTime\":\"2020-03-26T16:49:32Z\",\"leaderTransitions\":0}"
    },
    "creationTimestamp": "2020-03-23T18:31:29Z",
    "name": "example",
    "namespace": "default",
    "resourceVersion": "281064",
    "selfLink": "/api/v1/namespaces/default/endpoints/example",
    "uid": "d22ac690-ee3f-4ec2-a4e9-fe38f90b77b7"
  }
}
```

There is a specific annotation with key "control-plane.alpha.kubernetes.io/leader" which defines the leader election information on this example endpoint. 


## Overview: K8s resources

![k8s-leader-elector-example](/img/k8s-leader-elector-example.png)


## License

This repository is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

For a nice explanation of leader election concept in Kubernetes, see the following: 
* [Leader election in K8s control plane](https://blog.heptio.com/leader-election-in-kubernetes-control-plane-heptioprotip-1ed9fb0f3e6d)

Some inspiration is taken from the following blog posts: 
* [Simple Leader Election with Kubernetes and Docker](https://github.com/kubernetes-retired/contrib/tree/master/election)
* [Implementing leader election for Kubernetes pods](https://tunein.engineering/implementing-leader-election-for-kubernetes-pods-2477deef8f13)