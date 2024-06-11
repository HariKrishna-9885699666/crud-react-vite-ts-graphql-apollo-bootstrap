import React, { useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import {
  Button,
  Table,
  Modal,
  Form,
  Spinner, // Import Spinner
  Alert, // Import Alert
} from "react-bootstrap";
import swal from "sweetalert";
import { useForm } from "react-hook-form";

interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  age: number;
  phoneNumber: string;
  email: string;
  jobLocation: string;
}

const GET_EMPLOYEES = gql`
  query {
    getEmployees {
      id
      firstName
      lastName
      age
      phoneNumber
      email
      jobLocation
      createdAt
      posts {
        id
        title
        content
        createdAt
        comments {
          id
          content
          createdAt
        }
      }
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: Int!) {
    deleteEmployee(id: $id)
  }
`;

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee(
    $firstName: String!
    $lastName: String!
    $age: Int!
    $phoneNumber: String!
    $email: String!
    $jobLocation: String!
  ) {
    createEmployee(
      firstName: $firstName
      lastName: $lastName
      age: $age
      phoneNumber: $phoneNumber
      email: $email
      jobLocation: $jobLocation
    ) {
      id
    }
  }
`;

const EmployeeList: React.FC = () => {
  const [addEmployeeError, setAddEmployeeError] = useState<Error | null>(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormValues>();

  const [createEmployee] = useMutation(CREATE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
  });

  const {
    loading: getEmployeesLoading,
    error: getEmployeesError,
    data,
  } = useQuery(GET_EMPLOYEES);
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    awaitRefetchQueries: true,
  });

  const handleDelete = async (id: number) => {
    const willDelete = await swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this employee!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    });

    if (willDelete) {
      await deleteEmployee({ variables: { id } });
      swal("Employee has been deleted!", { icon: "success" });
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      await createEmployee({ variables: data });
      swal("Employee Added!", { icon: "success" });
      setShowAddEmployeeModal(false);
      reset();
      setAddEmployeeError(null); // Clear any previous error
    } catch (error: any) {
      setAddEmployeeError(error); // Set the error state
      console.error("Error creating employee:", error);
    }
  };

  // Sort employees by id in descending order
  const sortedEmployees = data?.getEmployees
    .slice()
    .sort((a: any, b: any) => b.id - a.id);

  // Loading State
  if (getEmployeesLoading)
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  // Error State (for GET_EMPLOYEES)
  if (getEmployeesError)
    return <Alert variant="danger">Error: {getEmployeesError.message}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between mb-4">
        {" "}
        {/* Added flexbox */}
        <h1>Employee List</h1>
        <Button onClick={() => setShowAddEmployeeModal(true)}>
          Add Employee
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedEmployees.length > 0 ? (
            sortedEmployees.map((employee: any) => (
              <tr key={employee.id}>
                <td>
                  {employee.firstName} {employee.lastName}
                </td>
                <td>{employee.phoneNumber}</td>
                <td>{employee.email}</td>
                <td>
                  <Link to={`/employee/${employee.id}`} className="me-2">
                    <Button variant="outline-info" className="mr-2">
                      View Posts
                    </Button>
                  </Link>

                  <Button
                    variant="outline-danger"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {/* Add Employee Modal */}
      <Modal
        show={showAddEmployeeModal}
        onHide={() => setShowAddEmployeeModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name */}
            <Form.Group controlId="firstName" className="mb-2">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 10,
                    message: "First name cannot exceed 10 characters",
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Only letters and spaces allowed",
                  },
                })}
              />
              {errors.firstName && (
                <p className="text-danger">{errors.firstName.message}</p>
              )}
            </Form.Group>

            {/* Last Name (similar validation rules as First Name) */}
            <Form.Group controlId="lastName" className="mb-2">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 10,
                    message: "Last name cannot exceed 10 characters",
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Only letters and spaces allowed",
                  },
                })}
              />
              {errors.lastName && (
                <p className="text-danger">{errors.lastName.message}</p>
              )}
            </Form.Group>

            {/* Age */}
            <Form.Group controlId="age" className="mb-2">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter age"
                {...register("age", {
                  valueAsNumber: true,
                  required: "Age is required",
                  min: { value: 18, message: "Age must be at least 18" },
                  max: { value: 100, message: "Age cannot exceed 100" },
                })}
              />
              {errors.age && (
                <p className="text-danger">{errors.age.message}</p>
              )}
            </Form.Group>

            {/* Phone Number */}
            <Form.Group controlId="phoneNumber" className="mb-2">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value:
                      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                    message:
                      "Invalid phone number format (e.g., +1-555-555-5555)",
                  },
                })}
              />
              {errors.phoneNumber && (
                <p className="text-danger">{errors.phoneNumber.message}</p>
              )}
            </Form.Group>

            {/* Email */}
            <Form.Group controlId="email" className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-danger">{errors.email.message}</p>
              )}
            </Form.Group>

            {/* Job Location */}
            <Form.Group controlId="jobLocation" className="mb-2">
              <Form.Label>Job Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter job location"
                {...register("jobLocation", {
                  required: "Job location is required",
                  minLength: {
                    value: 2,
                    message: "Job location must be at least 2 characters",
                  },
                })}
              />
              {errors.jobLocation && (
                <p className="text-danger">{errors.jobLocation.message}</p>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
          {/* Display the error related to adding an employee */}
          {addEmployeeError && (
            <Alert variant="danger">Error: {addEmployeeError.message}</Alert>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeList;
