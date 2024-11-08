import { backendURL, logout } from "../utils/utils.js";

logout();
getUserData();

const userForm = document.getElementById("user_form");

userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.querySelector("#user_form button").disabled = true;

    const formData = new FormData(userForm);

    const userResponse = await fetch(backendURL + "/api/users",{
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: formData,
        });
        const user = await userResponse.json();

        if(userResponse.ok) {
            alert("User added successfully!");
            console.log(user.message);
            await getUserData();
            userForm.reset();
        } else {
            alert("Failed to add user. Please try again." );
            console.log(user.message);
        }
    document.querySelector("#user_form button").disabled = false;
    document.querySelector("#user_form button").innerHTML = `Create a new user`;
    })
    async function getUserData(url) {
      const userResponse = await fetch(url || backendURL + "/api/users", {
          headers: {
              Accept: "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
          },
      });
  
      const profileResponse = await fetch(backendURL + "/api/profile/show", {
          headers: {
              Accept: "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
          },
      });
  
      const users = await userResponse.json();
      const profile = await profileResponse.json();
  
      if (userResponse.ok && profileResponse.ok) {
          let userHtml = "";
  
          users.data.forEach(user => {
              userHtml += `<tr>
                  <td class="fw-bold">
                      <img src="${user.image_path != null ? `${backendURL}/storage/${user.image_path}` : `src/imgs/logo1.png`}" width="25px" class="rounded-circle me-2" />${user.fullname}
                  </td>
                  <td>${user.email}</td>
                  <td>${user.phone_num}</td>
                  <td>${user.office_location}</td>
                  <td>${user.department}</td>
                  <td>${user.office_hours}</td>
                  <td><span class="fw-bold" style="color: #4f7942">${user.role}</span></td>
                  ${profile.role === 'Admin' || 'admin' ? `<td>
                      <div class="d-flex">
                          <button class="me-2 btn text-white" style="background-color: #4f7942" data-bs-toggle="offcanvas" data-bs-target="#updateBackdrop_${user.id}" aria-controls="updateBackdrop_${user.id}">Update</button>  
                          <button type="button" class="btn bg-secondary-subtle" id="deleteUserButton" data-id="${user.id}">
                              <img src="src/icon/trash.png" alt="" width="13px" id="deleteUserButton"/>
                          </button>
                      </div>
                      <div>${updateFormHTML(user)}</div>
                  </td>` : ``}
              </tr>
            
              `;
          });
  
          document.getElementById("getUsers").innerHTML = userHtml;

        if (profile.role == 'Admin' || 'admin') {
            document.getElementById("createUserButton").innerHTML = `<button
                    class="btn text-white"
                    style="background-color: #4f7942"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#staticBackdrop"
                    aria-controls="staticBackdrop"
                  >
                    Create new user
                  </button>`
        }

        let pagination = "";

        if (users.links) {
          users.links.forEach((link) => {
                pagination += `
                    <li class="page-item" >
                        <a class="page-link ${link.url == null ? " disabled" : ""}${link.active ? " active" : ""}" href="#" data-url="${link.url}" style="color: #4F7942">
                            ${link.label}
                        </a>
                    </li>`;
            });
        }

        document.getElementById("pages").innerHTML = pagination;

        document.querySelectorAll("#pages .page-link").forEach((link) => {
          link.addEventListener("click", pageAction);
      });

      document.addEventListener("click", (e) => {
        if (e.target.id === "deleteUserButton") {
            deleteUserClick(e);
        } else if (e.target.id === "updateUserButton") {
            updateUserClick(e);
        }
    });
    
    }else{ 
        console.log("Fetching users failed: ", users.message);
    }
}
const pageAction = async (e) => {
  e.preventDefault();
  const url = e.target.getAttribute("data-url");
  await getUserData(url);
}

function updateUserClick(e) {
  const user_id = e.target.getAttribute("data-id");
  console.log(user_id)
  updateUserData(user_id);
}

function deleteUserClick(e) {
  const user_id = e.target.getAttribute('data-id');
  console.log(user_id)
  deleteUserData(user_id);
  }

// Ensure you move this into the getUserData function
async function updateUserData(id) {
  const userForm = document.getElementById("userUpdate_form_" + id);
  console.log(userForm)
  // Ensure form exists before continuing
  if (!userForm) {
      console.error("User form not found!");
      return;
  }

  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.querySelector("updateButton_" + id).disabled = true;

    const formData = new FormData(userForm);
    formData.append("_method", "PUT");

    try {
        const userResponse = await fetch(backendURL + "/api/users/" + id, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: formData,
        });

        const userData = await userResponse.json();

        if (userResponse.ok) {
            console.log("Update successful:", userData.message);
            userForm.reset(); // Reset form after successful submission
            await getUserData(); // Refresh the user list
        } else {
            console.error("Update failed:", userData.message);
        }
    } catch (error) {
        console.error("Error updating user:", error);
    }

    document.querySelector("updateButton_" + id).disabled = false;
    document.querySelector("updateButton_" + id).innerHTML = `Update User`;
});
}


async function deleteUserData(id) {
  if (confirm("Are you sure you want to delete this user?")) {
      const userResponse = await fetch(backendURL + "/api/users/" + id, {
          method: "DELETE",
          headers: {
              Accept: "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
          },
      });
  
      const userData = await userResponse.json();
  
      if (userResponse.ok) {
          await getUserData();
      } else {
          console.error("Delete failed:", userData.message);
      }
  }
  }

  function updateFormHTML(user){
    return ` <!-- Update User Details -->
              <div class="offcanvas offcanvas-end rounded-start-4" data-bs-backdrop="static" tabindex="-1" id="updateBackdrop_${user.id}" aria-labelledby="updateBackdrop_${user.id}">
                  <div class="offcanvas-header">
                      <h5 class="offcanvas-title fw-bold" id="updateBackdrop_${user.id}">Update User</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                  </div>
                  <div class="offcanvas-body">
                      <div class="floating-form">
                          <form id="userUpdate_form_${user.id}">
                              <!-- Fullname -->
                              <div class="form-floating mb-3">
                                  <input type="text" class="form-control" id="fullname" name="fullname" value="${user.fullname}" />
                                  <label for="fullname">Fullname</label>
                              </div>
                              <!-- Email Address -->
                              <div class="form-floating mb-3">
                                  <input type="email" class="form-control" id="email" placeholder="Email Address" name="email" value="${user.email}"  />
                                  <label for="email">Email Address</label>
                              </div>
                              <!-- Phone Number -->
                              <div class="form-floating mb-3">
                                  <input type="text" class="form-control" id="phone_num" placeholder="Phone Number" name="phone_num" value="${user.phone_num}"  />
                                  <label for="phone_num">Phone Number</label>
                              </div>
                              <!-- Department -->
                              <div class="form-floating mb-3">
                                  <input type="text" class="form-control" id="department" placeholder="Department" name="department" value="${user.department}"  />
                                  <label for="department">Department</label>
                              </div>
                              <!-- Office Location -->
                              <div class="form-floating mb-3">
                                  <input type="text" class="form-control" id="office_location" placeholder="Office Location" name="office_location" value="${user.office_location}"  />
                                  <label for="office_location">Office Location</label>
                              </div>
                              <!-- Office Hours -->
                              <div class="form-floating mb-3">
                                  <input type="text" class="form-control" placeholder="Office Hours" name="office_hours" value="${user.office_hours}"  />
                                  <label for="office_hours">Office Hours</label>
                              </div>
                              <!-- Profile Picture -->
                              <div class="form-floating mb-3">
                                  <input type="file" class="form-control" placeholder="Profile Picture" name="image_path" accept="image/png, image/jpeg" />
                                  <label for="image">Profile Picture (optional)</label>
                              </div>
                              <!-- Role (Dropdown) -->
                              <div class="form-floating mb-3">
                                  <select class="form-select" id="role" name="role" >
                                      <option value="User" ${user.role === "User" || "user" ? `selected` : `` }>User</option>
                                      <option value="Admin" ${user.role === "Admin" || "admin" ? `selected` : `` }>Admin</option>
                                  </select>
                                  <label for="role">Role</label>
                              </div>
                              <!-- Submit Button -->
                              <div class="d-grid">
                                  <button type="submit" class="btn text-white updateButton_${user.id}" style="background-color: #4f7942" id="updateUserButton" data-id="${user.id}">Update user</button>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>`
  }