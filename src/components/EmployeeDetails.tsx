import React, { useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import PostDetails from "./PostDetails";
import {
  Card,
  Button,
  ListGroup,
  Container,
  Row,
  Col,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import swal from "sweetalert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye } from "@fortawesome/free-solid-svg-icons";

const GET_EMPLOYEE = gql`
  query getEmployee($id: Int!) {
    getEmployee(id: $id) {
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

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $employeeId: Int!) {
    createPost(title: $title, content: $content, employeeId: $employeeId) {
      id
      title
      content
      createdAt
    }
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($postId: Int!) {
    deletePost(id: $postId)
  }
`;

interface PostFormValues {
  title: string;
  content: string;
}

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_EMPLOYEE, {
    variables: { id: Number(id) },
  });
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>();

  const [createPost, { loading: createPostLoading, error: createPostError }] =
    useMutation(CREATE_POST, {
      refetchQueries: [{ query: GET_EMPLOYEE, variables: { id: Number(id) } }],
      onCompleted: () => {
        swal("Post Created!", { icon: "success" });
        setShowCreatePostModal(false);
        reset();
      },
    });

  const onSubmit = async (data: PostFormValues) => {
    await createPost({ variables: { ...data, employeeId: Number(id) } });
  };

  const [deletePost, { loading: deletePostLoading }] = useMutation(DELETE_POST, {
    refetchQueries: [{ query: GET_EMPLOYEE, variables: { id: Number(id) } }],
    onCompleted: () => {
      swal("Post Deleted!", { icon: "success" });
      if (selectedPost) {
        setSelectedPost(null); // Clear selectedPost after deletion
      }
    },
    onError: (error) => {
      swal("Error deleting post!", { icon: "error" });
      console.error("Error deleting post:", error);
    },
  });

  const handleDeletePost = async (postId: number) => {
    const willDelete = await swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this post!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    });

    if (willDelete) {
      try {
        await deletePost({ variables: { postId } });
        swal("Post Deleted!", { icon: "success" });
      } catch (error) {
        swal("Error deleting post!", { icon: "error" });
        console.error("Error deleting post:", error);
      }
    }
  };

  if (error) return <Alert variant="danger">Error: {error.message}</Alert>;

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
  };

  return (
    <Container>
      <Row className="mb-3">
        <Col className="d-flex justify-content-between">
          <Button
            onClick={() =>
              selectedPost ? setSelectedPost(null) : navigate(-1)
            }
            className="btn btn-primary"
          >
            Back
          </Button>

          {!selectedPost && (
            <Button
              onClick={() => setShowCreatePostModal(true)}
              className="btn btn-success"
            >
              Create Post
            </Button>
          )}

          {selectedPost && (
            <Button
              onClick={() => {
                /* Add comment logic here */
              }}
              className="btn btn-info"
              id="add-comment"
            >
              Add Comment
            </Button>
          )}
        </Col>
      </Row>

      {!selectedPost ? (
        <>
          <Card className="my-3">
            <Card.Header>
              <h1>{`${data.getEmployee.firstName} ${data.getEmployee.lastName}`}</h1>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col style={{ textAlign: "left" }}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Badge bg="secondary">Email:</Badge>{" "}
                      {data.getEmployee.email}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Badge bg="secondary">Phone Number:</Badge>{" "}
                      {data.getEmployee.phoneNumber}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Badge bg="secondary">Age:</Badge> {data.getEmployee.age}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Badge bg="secondary">Job Location:</Badge>{" "}
                      {data.getEmployee.jobLocation}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Badge bg="secondary">Created At:</Badge>{" "}
                      {new Date(
                        parseInt(data.getEmployee.createdAt)
                      ).toLocaleString()}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <h2 className="mt-4">Posts</h2>
          
          {/* Loading indicator while fetching, deleting, or creating comments */}
        {loading || deletePostLoading || createPostLoading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <ListGroup className="mt-2">
            {data.getEmployee.posts.length > 0 ? (
              data.getEmployee.posts.map((post: any) => (
                <ListGroup.Item
                  key={post.id}
                  action
                  active={selectedPost?.id === post.id}
                >
                  <Row>
                    <Col className="text-start">{post.title}</Col>
                    <Col className="text-end">
                      <Badge bg="secondary">
                        {new Date(parseInt(post.createdAt)).toLocaleString()}
                      </Badge>
                      <FontAwesomeIcon
                        icon={faEye}
                        className="text-primary ms-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handlePostClick(post)}
                        title="View Post"
                      />
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-danger ms-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete Post"
                      />
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>
                <div className="text-center">No posts found</div>
              </ListGroup.Item>
            )}
          </ListGroup>
          )}
        </>
      ) : (
        <PostDetails post={selectedPost} />
      )}
      <Modal
        show={showCreatePostModal}
        onHide={() => setShowCreatePostModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                {...register("title", { required: true })}
              />
              {errors.title && (
                <span className="text-danger">Title is required</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="content">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("content", { required: true })}
              />
              {errors.content && (
                <span className="text-danger">Content is required</span>
              )}
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={createPostLoading}
            >
              {createPostLoading ? "Creating..." : "Create"}
            </Button>
            {/* Error message if there's an error creating the post */}
            {createPostError && (
              <Alert variant="danger" className="mt-2">
                Error creating post: {createPostError.message}
              </Alert>
            )}
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployeeDetails;
