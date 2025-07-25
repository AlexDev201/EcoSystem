package com.ecoenergy.eco_energy.device.repository;

import com.ecoenergy.eco_energy.device.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository <Device, UUID> {
    //Buscamos por Status
    List<Device> findByStatus(Device.DeviceStatus status);
    //Buscamos los que esten activos
    @Query("SELECT d FROM Device d WHERE d.status = 'ACTIVE'")
    List<Device> findAllActive();
    //Buscamos por tipo
    List<Device> findByType(String type);
    // Buscamos por ubicación
    List<Device> findByLocationContainingIgnoreCase(String location);
    // Buscamos por label de Ubidots
    Optional<Device> findByUbidotsLabel(String ubidotsLabel);
    // Contar dispositivos activos
    @Query("SELECT COUNT(d) FROM Device d WHERE d.status = 'ACTIVE'")
    long countActiveDevices();
    // Buscamos por múltiples tipos
    List<Device> findByTypeIn(List<String> types);

}
