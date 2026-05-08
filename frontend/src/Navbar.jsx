import { Link } from "react-router-dom";
import forkKnifeIcon from "./assets/fork-and-knife.svg";
import profileIcon from "./assets/user.png";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="home-circle" aria-label="Home">
        <img src={forkKnifeIcon} alt="" className="home-icon" />
      </Link>

      <Link to="/login" className="profile-button">
        <span className="profile-text">LOGIN</span>
        <span className="profile-circle">
          <img src={profileIcon} alt="" className="profile-icon" />
        </span>
      </Link>
    </nav>
  );
};

export default Navbar;