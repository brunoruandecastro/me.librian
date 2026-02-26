package io.github.brunoruandecastro.librian.repository;

import org.springframework.stereotype.Repository;

import io.github.brunoruandecastro.librian.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {


}
