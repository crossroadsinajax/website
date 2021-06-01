# creating and managing orgs

- Create a new org using a Python repl

```python
>>> org = Org.objects.create(name="<org>")
```

- Go to wagtail admin
  - Create a new page under the site home for the org (all service pages will be
    created as children of this page)
  - Add a new group called `<org>_admin` with permissions to the wagtail admin
    panel and to modify pages under the page created above
  - Add relevant admins to the group
