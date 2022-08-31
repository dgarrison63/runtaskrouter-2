terraform {
  cloud {
    organization = "f5networks-bd"

    workspaces {
      name = "terraform-run-tasks"
    }
  }
}
