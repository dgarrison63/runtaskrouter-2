resource "bigip_as3" "nginx" {
  as3_json = file("files/as3.json")
  #  tenant_name = "consul_sd"
  #  depends_on  = [null_resource.install_as3]
}
